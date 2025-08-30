'use client';
// Harness único mínimo para /servicos (elimina duplicidades). Foca apenas nos seletores usados nos testes.
import React, { useState } from 'react';

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string; // corte | barba
  description?: string;
  archived?: boolean;
  professionalId?: string;
  commission?: number;
};

const initial: Service[] = [
  { id: 'svc-1', name: 'Corte Masculino', price: 45, duration: 45, category: 'corte' },
];
const professionals = [
  { id: 'prof-1', name: 'Profissional TESTE' },
  { id: 'prof-2', name: 'Profissional 2' },
];

export default function ServicosHarnessPage() {
  const [services, setServices] = useState<Service[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('');
  const [categoria, setCategoria] = useState('corte');
  const [descricao, setDescricao] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<Service | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState('');
  const [vinculoOpen, setVinculoOpen] = useState(false);
  const [vinculoService, setVinculoService] = useState<Service | null>(null);
  const [profissionalSel, setProfissionalSel] = useState('');
  const [comissao, setComissao] = useState('');
  const [confirmRemocao, setConfirmRemocao] = useState(false);
  const [confirmArquivar, setConfirmArquivar] = useState<Service | null>(null);

  function resetForm() {
    setNome('');
    setPreco('');
    setDuracao('');
    setCategoria('corte');
    setDescricao('');
    setErrors({});
    setEditing(null);
  }
  function openCreate() {
    resetForm();
    setShowForm(true);
  }
  function openEdit(s: Service) {
    setEditing(s);
    setNome(s.name);
    setPreco(s.price.toFixed(2));
    setDuracao(String(s.duration));
    setCategoria(s.category);
    setDescricao(s.description || '');
    setShowForm(true);
  }
  function validate() {
    const e: Record<string, boolean> = {};
    const p = Number(preco.replace(',', '.'));
    const d = Number(duracao);
    if (!nome.trim()) e.nome = true;
    if (!(p > 0)) e.preco = true;
    if (!(d > 0 && d <= 240)) e.duracao = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  function save() {
    if (!validate()) return;
    const p = Number(preco.replace(',', '.'));
    const d = Number(duracao);
    setServices((prev) =>
      editing
        ? prev.map((s) =>
            s.id === editing.id
              ? {
                  ...s,
                  name: nome,
                  price: p,
                  duration: d,
                  category: categoria,
                  description: descricao,
                }
              : s,
          )
        : [
            ...prev,
            {
              id: 'svc-' + (prev.length + 1),
              name: nome,
              price: p,
              duration: d,
              category: categoria,
              description: descricao,
            },
          ],
    );
    setNotification('Saved');
    setTimeout(() => setNotification(null), 1000);
    setShowForm(false);
    resetForm();
  }
  function applyVinculo() {
    if (vinculoService && profissionalSel) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === vinculoService.id
            ? { ...s, professionalId: profissionalSel, commission: Number(comissao) }
            : s,
        ),
      );
      setNotification('Vinculado');
      setTimeout(() => setNotification(null), 1000);
      // Manter modal aberto para permitir remoção imediata conforme teste
      setProfissionalSel('');
      setComissao('');
      setConfirmRemocao(false);
    }
  }
  function removerVinculo() {
    if (!vinculoService) return;
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === vinculoService.id) {
          return { ...s, professionalId: undefined, commission: undefined };
        }
        return s;
      }),
    );
    setNotification('Vínculo removido');
    setTimeout(() => setNotification(null), 1000);
    setConfirmRemocao(false);
  }
  function arquivar(s: Service) {
    setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, archived: true } : x)));
    setNotification('Archived');
    setTimeout(() => setNotification(null), 1000);
    setConfirmArquivar(null);
  }

  const filtrados = services
    .filter((s) => !filtroCategoria || s.category === filtroCategoria)
    .filter((s) => !busca || s.name.toLowerCase().includes(busca.toLowerCase()));
  const ordenados = [...filtrados].sort((a, b) =>
    ordenacao === 'preco-asc'
      ? a.price - b.price
      : ordenacao === 'preco-desc'
        ? b.price - a.price
        : a.name.localeCompare(b.name),
  );

  return (
    <div data-testid="servicos-content" style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Botão principal visível com o data-testid esperado pelos testes */}
        <button data-testid="btn-novo-servico" onClick={openCreate}>
          Novo Serviço
        </button>
        {/* Botão extra usado em smoke.spec (novo-servico-button) */}
        <button
          data-testid="novo-servico-button"
          onClick={openCreate}
          style={{
            padding: '8px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          Novo Serviço
        </button>
        <select
          data-testid="select-filtro-categoria"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="corte">Corte</option>
          <option value="barba">Barba</option>
        </select>
        <input
          data-testid="input-busca-servico"
          placeholder="Buscar"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          data-testid="select-ordenacao"
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value)}
        >
          <option value="">Nome</option>
          <option value="preco-asc">Preço Crescente</option>
          <option value="preco-desc">Preço Decrescente</option>
        </select>
      </div>
      {notification && (
        <div
          data-testid="notification-success"
          style={{ background: '#d1fadf', padding: 8, marginBottom: 12 }}
        >
          {notification}
        </div>
      )}
      <div data-testid="servicos-list" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ordenados.map((s) => (
          <div
            key={s.id}
            data-testid="servico-item"
            style={{ border: '1px solid #ccc', padding: 8, opacity: s.archived ? 0.6 : 1 }}
          >
            <strong>{s.name}</strong> - R$ {s.price.toFixed(2).replace('.', ',')} - {s.duration} min
            {s.archived && (
              <span data-testid="servico-arquivado" style={{ marginLeft: 6 }}>
                (Arquivado)
              </span>
            )}
            {s.professionalId && (
              <span data-testid="profissional-vinculado" style={{ marginLeft: 6 }}>
                Vinculado
              </span>
            )}
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <button data-testid="btn-editar-servico" onClick={() => openEdit(s)}>
                Editar
              </button>
              <button data-testid="btn-ver-detalhes" onClick={() => setShowDetails(s)}>
                Detalhes
              </button>
              <button data-testid="btn-acoes-servico" onClick={() => setConfirmArquivar(s)}>
                Arquivar
              </button>
              <button
                data-testid="btn-vincular-profissional"
                onClick={() => {
                  setVinculoService(s);
                  setVinculoOpen(true);
                }}
              >
                Vincular Profissional
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div
          data-testid="modal-form-servico"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ background: '#fff', padding: 16, minWidth: 340 }}>
            <h2>{editing ? 'Editar Serviço' : 'Novo Serviço'}</h2>
            <input
              data-testid="input-nome"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            {errors.nome && (
              <div data-testid="error-nome" style={{ color: 'red' }}>
                Nome obrigatório
              </div>
            )}
            <textarea
              data-testid="input-descricao"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              style={{ width: '100%', minHeight: 60 }}
            />
            <input
              data-testid="input-preco"
              placeholder="Preço"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
            {errors.preco && (
              <div data-testid="error-preco" style={{ color: 'red' }}>
                Preço inválido
              </div>
            )}
            <input
              data-testid="input-duracao"
              placeholder="Duração"
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
            />
            {errors.duracao && (
              <div data-testid="error-duracao" style={{ color: 'red' }}>
                Duração inválida
              </div>
            )}
            <select
              data-testid="select-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="corte">Corte</option>
              <option value="barba">Barba</option>
            </select>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button data-testid="btn-salvar" onClick={save}>
                Salvar
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetails && (
        <div
          data-testid="modal-detalhes-servico"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ background: '#fff', padding: 16, minWidth: 320 }}>
            <h2 data-testid="nome-servico">{showDetails.name}</h2>
            <p data-testid="preco-servico">R$ {showDetails.price.toFixed(2).replace('.', ',')}</p>
            <p data-testid="duracao-servico">{showDetails.duration} min</p>
            <p data-testid="categoria-servico">
              {showDetails.category === 'corte' ? 'Corte' : 'Barba'}
            </p>
            <button onClick={() => setShowDetails(null)}>Fechar</button>
          </div>
        </div>
      )}

      {vinculoOpen && vinculoService && (
        <div
          data-testid="modal-vinculo"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ background: '#fff', padding: 16, minWidth: 360 }}>
            <h2>Vincular Profissional</h2>
            <select
              data-testid="select-profissional"
              value={profissionalSel}
              onChange={(e) => setProfissionalSel(e.target.value)}
            >
              <option value="">Selecione</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              data-testid="input-comissao"
              placeholder="Comissão %"
              value={comissao}
              onChange={(e) => setComissao(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button data-testid="btn-salvar-vinculo" onClick={applyVinculo}>
                Salvar Vínculo
              </button>
              <button data-testid="btn-remover-vinculo" onClick={() => setConfirmRemocao(true)}>
                Remover Vínculo
              </button>
              <button
                onClick={() => {
                  setVinculoOpen(false);
                  setVinculoService(null);
                }}
              >
                Fechar
              </button>
            </div>
            {confirmRemocao && (
              <div style={{ marginTop: 12 }}>
                <p>Confirmar remoção?</p>
                <button data-testid="btn-confirmar-remocao" onClick={removerVinculo}>
                  Confirmar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmArquivar && (
        <div
          data-testid="modal-arquivar"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ background: '#fff', padding: 16, minWidth: 300 }}>
            <p>Arquivar serviço?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                data-testid="btn-arquivar-servico"
                onClick={() => setConfirmArquivar(confirmArquivar)}
              >
                Arquivar
              </button>
              <button
                data-testid="btn-confirmar-arquivamento"
                onClick={() => arquivar(confirmArquivar!)}
              >
                Confirmar
              </button>
              <button onClick={() => setConfirmArquivar(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
