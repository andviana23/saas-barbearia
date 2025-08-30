'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';

interface CategoriaReceita {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icon?: string;
  categoria_pai_id?: string;
  meta_mensal?: number;
  objetivo_percentual?: number;
  tipo_meta?: 'valor' | 'percentual' | 'quantidade';
  ativo: boolean;
  ordem?: number;
  created_at?: string;
  updated_at?: string;
}

export async function getTiposCategoriasReceita() {
  try {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('tipos_categoria_receita')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias de receita:', error);
      return {
        success: false,
        error: 'Erro ao carregar categorias de receita',
        data: [],
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Erro interno ao buscar categorias de receita:', error);
    return {
      success: false,
      error: 'Erro interno do sistema',
      data: [],
    };
  }
}

export async function createTipoCategoriaReceita(formData: FormData) {
  try {
    const supabase = createServerSupabase();

    const codigo = formData.get('codigo') as string;
    const nome = formData.get('nome') as string;
    const descricao = formData.get('descricao') as string;
    const cor_primaria = formData.get('cor_primaria') as string;
    const icone = formData.get('icone') as string;
    const parent_id = formData.get('parent_id') as string;
    const meta_mensal = formData.get('meta_mensal') as string;
    const objetivo_percentual = formData.get('objetivo_percentual') as string;
    const tipo_meta = formData.get('tipo_meta') as string;
    const ativo = formData.get('ativo') === 'true';
    const ordem = parseInt(formData.get('ordem') as string) || 0;

    // Validações básicas
    if (!codigo || !nome) {
      return {
        success: false,
        error: 'Código e nome são obrigatórios',
      };
    }

    // Verificar se código já existe
    const { data: existingCategoria } = await supabase
      .from('tipos_categoria_receita')
      .select('id')
      .eq('codigo', codigo.toUpperCase())
      .single();

    if (existingCategoria) {
      return {
        success: false,
        error: 'Já existe uma categoria com este código',
      };
    }

    // Validar categoria pai se fornecida
    if (parent_id) {
      const { data: parentCategoria } = await supabase
        .from('tipos_categoria_receita')
        .select('id')
        .eq('id', parent_id)
        .single();

      if (!parentCategoria) {
        return {
          success: false,
          error: 'Categoria pai não encontrada',
        };
      }
    }

    const categoriaData = {
      codigo: codigo.toUpperCase(),
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      cor_primaria: cor_primaria || '#1976d2',
      icone: icone || null,
      categoria_pai_id: parent_id || null,
      meta_mensal: meta_mensal ? parseFloat(meta_mensal) : null,
      objetivo_percentual: objetivo_percentual ? parseFloat(objetivo_percentual) : null,
      tipo_meta: tipo_meta || 'valor',
      ativo,
      ordem,
    };

    const { data, error } = await supabase
      .from('tipos_categoria_receita')
      .insert([categoriaData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria de receita:', error);
      return {
        success: false,
        error: 'Erro ao criar categoria de receita',
      };
    }

    revalidatePath('/tipos/receitas');
    revalidatePath('/tipos/categorias-receitas');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Erro interno ao criar categoria de receita:', error);
    return {
      success: false,
      error: 'Erro interno do sistema',
    };
  }
}

export async function updateTipoCategoriaReceita(formData: FormData) {
  try {
    const supabase = createServerSupabase();

    const id = formData.get('id') as string;
    const codigo = formData.get('codigo') as string;
    const nome = formData.get('nome') as string;
    const descricao = formData.get('descricao') as string;
    const cor_primaria = formData.get('cor_primaria') as string;
    const icone = formData.get('icone') as string;
    const parent_id = formData.get('parent_id') as string;
    const meta_mensal = formData.get('meta_mensal') as string;
    const objetivo_percentual = formData.get('objetivo_percentual') as string;
    const tipo_meta = formData.get('tipo_meta') as string;
    const ativo = formData.get('ativo') === 'true';
    const ordem = parseInt(formData.get('ordem') as string) || 0;

    if (!id || !codigo || !nome) {
      return {
        success: false,
        error: 'ID, código e nome são obrigatórios',
      };
    }

    // Verificar se categoria existe
    const { data: existingCategoria } = await supabase
      .from('tipos_categoria_receita')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingCategoria) {
      return {
        success: false,
        error: 'Categoria não encontrada',
      };
    }

    // Verificar se código já existe em outra categoria
    const { data: duplicateCategoria } = await supabase
      .from('tipos_categoria_receita')
      .select('id')
      .eq('codigo', codigo.toUpperCase())
      .neq('id', id)
      .single();

    if (duplicateCategoria) {
      return {
        success: false,
        error: 'Já existe outra categoria com este código',
      };
    }

    // Validar categoria pai se fornecida
    if (parent_id && parent_id !== id) {
      const { data: parentCategoria } = await supabase
        .from('tipos_categoria_receita')
        .select('id')
        .eq('id', parent_id)
        .single();

      if (!parentCategoria) {
        return {
          success: false,
          error: 'Categoria pai não encontrada',
        };
      }

      // Prevenir loop infinito na hierarquia
      if (await wouldCreateLoop(supabase, id, parent_id)) {
        return {
          success: false,
          error: 'Esta operação criaria um loop na hierarquia',
        };
      }
    }

    const categoriaData = {
      codigo: codigo.toUpperCase(),
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      cor_primaria: cor_primaria || '#1976d2',
      icone: icone || null,
      categoria_pai_id: parent_id || null,
      meta_mensal: meta_mensal ? parseFloat(meta_mensal) : null,
      objetivo_percentual: objetivo_percentual ? parseFloat(objetivo_percentual) : null,
      tipo_meta: tipo_meta || 'valor',
      ativo,
      ordem,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('tipos_categoria_receita')
      .update(categoriaData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar categoria de receita:', error);
      return {
        success: false,
        error: 'Erro ao atualizar categoria de receita',
      };
    }

    revalidatePath('/tipos/receitas');
    revalidatePath('/tipos/categorias-receitas');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Erro interno ao atualizar categoria de receita:', error);
    return {
      success: false,
      error: 'Erro interno do sistema',
    };
  }
}

export async function deleteTipoCategoriaReceita(id: string) {
  try {
    const supabase = createServerSupabase();

    if (!id) {
      return {
        success: false,
        error: 'ID é obrigatório',
      };
    }

    // Verificar se categoria existe
    const { data: categoria } = await supabase
      .from('tipos_categoria_receita')
      .select('id, nome')
      .eq('id', id)
      .single();

    if (!categoria) {
      return {
        success: false,
        error: 'Categoria não encontrada',
      };
    }

    // Verificar se há subcategorias
    const { data: subcategorias } = await supabase
      .from('tipos_categoria_receita')
      .select('id')
      .eq('categoria_pai_id', id);

    if (subcategorias && subcategorias.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir uma categoria que possui subcategorias',
      };
    }

    // TODO: Verificar dependências em outras tabelas (receitas, movimentações, etc.)
    // const { data: dependencias } = await supabase
    //   .from('receitas')
    //   .select('id')
    //   .eq('categoria_receita_id', id)
    //   .limit(1);

    // if (dependencias && dependencias.length > 0) {
    //   return {
    //     success: false,
    //     error: 'Não é possível excluir uma categoria que está sendo usada em receitas',
    //   };
    // }

    const { error } = await supabase.from('tipos_categoria_receita').delete().eq('id', id);

    if (error) {
      console.error('Erro ao excluir categoria de receita:', error);
      return {
        success: false,
        error: 'Erro ao excluir categoria de receita',
      };
    }

    revalidatePath('/tipos/receitas');
    revalidatePath('/tipos/categorias-receitas');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro interno ao excluir categoria de receita:', error);
    return {
      success: false,
      error: 'Erro interno do sistema',
    };
  }
}

// Função auxiliar para detectar loops na hierarquia
async function wouldCreateLoop(
  supabase: ReturnType<typeof createServerSupabase>,
  categoriaId: string,
  novoPaiId: string,
): Promise<boolean> {
  const visited = new Set<string>();
  let currentId = novoPaiId;

  while (currentId && !visited.has(currentId)) {
    if (currentId === categoriaId) {
      return true; // Loop detectado
    }

    visited.add(currentId);

    const { data } = await supabase
      .from('tipos_categoria_receita')
      .select('categoria_pai_id')
      .eq('id', currentId)
      .single();

    currentId = data?.categoria_pai_id;
  }

  return false;
}

interface CategoriaReceitaTree extends CategoriaReceita {
  subcategorias: CategoriaReceitaTree[];
}

export async function buildCategoryTreeReceitas(
  categorias: CategoriaReceita[],
): Promise<CategoriaReceitaTree[]> {
  const categoriaMap = new Map<string, CategoriaReceitaTree>();
  const roots: CategoriaReceitaTree[] = [];

  // Primeiro passo: criar mapa com arrays de subcategorias
  categorias.forEach((categoria) => {
    categoriaMap.set(categoria.id, { ...categoria, subcategorias: [] });
  });

  // Segundo passo: construir estrutura de árvore
  categorias.forEach((categoria) => {
    const categoriaWithChildren = categoriaMap.get(categoria.id)!;

    if (categoria.categoria_pai_id) {
      const parent = categoriaMap.get(categoria.categoria_pai_id);
      if (parent) {
        parent.subcategorias.push(categoriaWithChildren);
      } else {
        roots.push(categoriaWithChildren);
      }
    } else {
      roots.push(categoriaWithChildren);
    }
  });

  // Ordenar categorias por nome
  const sortCategories = (cats: CategoriaReceitaTree[]) => {
    cats.sort((a, b) => a.nome.localeCompare(b.nome));
    cats.forEach((cat) => {
      if (cat.subcategorias) {
        sortCategories(cat.subcategorias);
      }
    });
  };

  sortCategories(roots);
  return roots;
}
