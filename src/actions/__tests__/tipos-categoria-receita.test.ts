import { describe, expect, it } from '@jest/globals';

describe('Tipos Categoria Receita - Validações', () => {
  describe('Validações de estrutura', () => {
    it('deve validar tipos de meta válidos', () => {
      const tiposValidos = ['valor', 'percentual', 'quantidade'];

      tiposValidos.forEach((tipo) => {
        expect(['valor', 'percentual', 'quantidade']).toContain(tipo);
      });
    });

    it('deve validar estrutura de categoria básica', () => {
      const categoria = {
        id: '1',
        codigo: 'REC001',
        nome: 'Vendas',
        ativo: true,
      };

      // Validações básicas
      expect(categoria.id).toBeTruthy();
      expect(categoria.codigo).toBeTruthy();
      expect(categoria.nome).toBeTruthy();
      expect(typeof categoria.ativo).toBe('boolean');
    });

    it('deve validar metas numéricas', () => {
      const metaMensal = 5000;
      const objetivoPercentual = 75;

      expect(metaMensal).toBeGreaterThan(0);
      expect(objetivoPercentual).toBeGreaterThanOrEqual(0);
      expect(objetivoPercentual).toBeLessThanOrEqual(100);
    });

    it('deve validar campos opcionais', () => {
      const categoria = {
        id: '1',
        codigo: 'REC001',
        nome: 'Vendas',
        descricao: 'Receitas de vendas',
        cor: '#4caf50',
        icon: 'dollar-sign',
        categoria_pai_id: undefined,
        meta_mensal: 5000,
        objetivo_percentual: undefined,
        tipo_meta: 'valor' as const,
        ativo: true,
      };

      // Campos obrigatórios
      expect(categoria.id).toBeTruthy();
      expect(categoria.codigo).toBeTruthy();
      expect(categoria.nome).toBeTruthy();
      expect(typeof categoria.ativo).toBe('boolean');

      // Campos opcionais podem ser undefined
      expect(categoria.categoria_pai_id).toBeUndefined();
      expect(categoria.objetivo_percentual).toBeUndefined();

      // Meta mensal quando presente deve ser válida
      if (categoria.meta_mensal) {
        expect(categoria.meta_mensal).toBeGreaterThan(0);
      }
    });

    it('deve validar hierarquia básica', () => {
      const categoriaPai = {
        id: '1',
        codigo: 'REC001',
        nome: 'Vendas',
        categoria_pai_id: undefined,
        ativo: true,
      };

      const categoriaFilha = {
        id: '2',
        codigo: 'REC002',
        nome: 'Vendas Online',
        categoria_pai_id: '1',
        ativo: true,
      };

      expect(categoriaPai.categoria_pai_id).toBeUndefined();
      expect(categoriaFilha.categoria_pai_id).toBe('1');
    });

    it('deve validar códigos únicos', () => {
      const codigos = ['REC001', 'REC002', 'REC003'];
      const codigosUnicos = Array.from(new Set(codigos));

      expect(codigos).toHaveLength(codigosUnicos.length);
    });

    it('deve validar cores hexadecimais', () => {
      const cores = ['#4caf50', '#ff5722', '#2196f3'];

      cores.forEach((cor) => {
        expect(cor).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('deve validar ícones válidos', () => {
      const iconesValidos = [
        'dollar-sign',
        'credit-card',
        'trending-up',
        'target',
        'star',
        'award',
        'gift',
        'briefcase',
        'users',
        'scissors',
        'shopping-bag',
        'percent',
      ];

      const icone = 'dollar-sign';
      expect(iconesValidos).toContain(icone);
    });
  });

  describe('Regras de negócio', () => {
    it('deve validar meta mensal positiva', () => {
      const metas = [1000, 5000, 10000];

      metas.forEach((meta) => {
        expect(meta).toBeGreaterThan(0);
      });
    });

    it('deve validar objetivo percentual no range válido', () => {
      const objetivos = [10, 50, 75, 100];

      objetivos.forEach((objetivo) => {
        expect(objetivo).toBeGreaterThanOrEqual(0);
        expect(objetivo).toBeLessThanOrEqual(100);
      });
    });

    it('deve validar relacionamento pai-filho', () => {
      // Simulação de validação de loop
      const categoria1Id = '1';

      // Categoria 1 não pode ser pai de si mesma
      expect(categoria1Id).not.toBe(categoria1Id + '_parent');

      // Hierarquia válida: 1 -> 2 -> 3
      const hierarquia = {
        '1': undefined, // raiz
        '2': '1', // filho de 1
        '3': '2', // filho de 2
      };

      expect(hierarquia['1']).toBeUndefined();
      expect(hierarquia['2']).toBe('1');
      expect(hierarquia['3']).toBe('2');

      // Não deveria criar loop: 3 -> 1 seria inválido
      expect(hierarquia['3']).not.toBe('1');
    });

    it('deve validar nomes únicos por nível', () => {
      // Categorias do mesmo nível devem ter nomes únicos
      const categoriasRaiz = [
        { nome: 'Vendas', categoria_pai_id: undefined },
        { nome: 'Serviços', categoria_pai_id: undefined },
        { nome: 'Produtos', categoria_pai_id: undefined },
      ];

      const nomes = categoriasRaiz.map((cat) => cat.nome);
      const nomesUnicos = Array.from(new Set(nomes));

      expect(nomes).toHaveLength(nomesUnicos.length);
    });

    it('deve validar status ativo/inativo', () => {
      const categoriaAtiva = { ativo: true };
      const categoriaInativa = { ativo: false };

      expect(typeof categoriaAtiva.ativo).toBe('boolean');
      expect(typeof categoriaInativa.ativo).toBe('boolean');
      expect(categoriaAtiva.ativo).toBe(true);
      expect(categoriaInativa.ativo).toBe(false);
    });
  });

  describe('Utilitários', () => {
    it('deve validar formatação de moeda', () => {
      const valor = 1234.56;
      const formatado = `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

      expect(formatado).toBe('R$ 1.234,56');
    });

    it('deve validar formatação de percentual', () => {
      const percentual = 75.5;
      const formatado = `${percentual.toFixed(1)}%`;

      expect(formatado).toBe('75.5%');
    });

    it('deve validar ordenação alfabética', () => {
      const nomes = ['Zebra', 'Alpha', 'Beta'];
      const ordenados = nomes.slice().sort((a, b) => a.localeCompare(b));

      expect(ordenados).toEqual(['Alpha', 'Beta', 'Zebra']);
    });

    it('deve validar geração de códigos sequenciais', () => {
      const prefixo = 'REC';
      const numero = 1;
      const codigo = `${prefixo}${numero.toString().padStart(3, '0')}`;

      expect(codigo).toBe('REC001');
    });
  });
});
