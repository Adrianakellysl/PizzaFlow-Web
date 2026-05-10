import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ChefHat,
  ClipboardList,
  History,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Send,
  Settings,
  Trash2,
  Utensils,
  X
} from 'lucide-react';
import { API_URL, api, clearToken, getToken, setToken } from './api/client.js';

const CARDAPIO = [
  { nome: 'Pizza Calabresa', preco: 45 },
  { nome: 'Pizza Mussarela', preco: 40 },
  { nome: 'Pizza Portuguesa', preco: 48 },
  { nome: 'Pizza Frango com Catupiry', preco: 50 },
  { nome: 'Pizza Quatro Queijos', preco: 52 },
  { nome: 'Pizza Marguerita', preco: 46 },
  { nome: 'Pizza Pepperoni', preco: 54 },
  { nome: 'Refrigerante', preco: 8 },
  { nome: 'Suco Natural', preco: 10 },
  { nome: 'Agua', preco: 5 }
];

const STATUS_FLOW = ['recebido', 'preparando', 'pronto', 'entregue'];
const STATUS_ATIVOS = ['recebido', 'preparando', 'pronto'];

const STATUS_LABELS = {
  recebido: 'Recebido',
  preparando: 'Preparando',
  pronto: 'Pronto',
  entregue: 'Entregue'
};

function getPedidoId(pedido) {
  return pedido.id || pedido._id;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function getPedidoCreatedAt(pedido) {
  return (
    pedido.createdAt ||
    pedido.created_at ||
    pedido.criadoEm ||
    pedido.criado_em ||
    pedido.dataCriacao ||
    pedido.data_criacao ||
    pedido.timestamp ||
    pedido.timestamps?.createdAt ||
    pedido.timestamps?.created_at
  );
}

function formatDateTime(value) {
  if (!value) return 'Data nao informada';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data invalida';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getPrecoPizza(nome) {
  return CARDAPIO.find((pizza) => pizza.nome === nome)?.preco || 0;
}

function calcularSubtotal(itens) {
  return itens.reduce((total, item) => total + getPrecoPizza(item.nome) * Number(item.quantidade || 0), 0);
}

function normalizarItens(itens) {
  return itens.map((item) => ({
    nome: item.nome,
    quantidade: Number(item.quantidade)
  }));
}

function validarItens(itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    return 'Adicione pelo menos uma pizza ao pedido.';
  }

  for (const item of itens) {
    if (!item.nome || !CARDAPIO.some((pizza) => pizza.nome === item.nome)) {
      return 'Escolha apenas pizzas cadastradas no cardapio.';
    }

    if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
      return 'A quantidade de cada pizza precisa ser um numero inteiro maior que zero.';
    }
  }

  return '';
}

function validarPedido(cliente, itens) {
  if (!cliente.trim()) {
    return 'Cliente e obrigatorio.';
  }

  return validarItens(itens);
}

export function Login({ onLogin, message }) {
  const [email, setEmail] = useState('admin@pizzaria.com');
  const [senha, setSenha] = useState('');
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const senhaRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setEmailError('');
    setSenhaError('');

    const credentials = {
      email: email.trim(),
      senha: senha.trim()
    };

    let hasError = false;
    if (!credentials.email) {
      setEmailError('Campo obrigatorio');
      hasError = true;
    }
    if (!credentials.senha) {
      setSenhaError('Campo obrigatorio');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);

    try {
      const data = await api.login(credentials);
      setToken(data.token);
      onLogin();
    } catch (error) {
      setErro(error.message);
      if (error.message.toLowerCase().includes('senha invalidos')) {
        setSenha('');
        senhaRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-mark">
          <ChefHat size={34} />
        </div>
        <h1>PizzaFlow</h1>
        <p>Atendimento rapido para pedidos quentinhos, status claros e cozinha em movimento.</p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setEmailError(''); }}
              placeholder="admin@pizzaria.com"
              style={emailError ? { borderColor: 'var(--danger)' } : {}}
            />
            {emailError && <span style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '-4px' }}>{emailError}</span>}
          </label>
          <label>
            Senha
            <input
              ref={senhaRef}
              type="password"
              value={senha}
              onChange={(event) => { setSenha(event.target.value); setSenhaError(''); }}
              placeholder="Digite sua senha"
              style={senhaError ? { borderColor: 'var(--danger)' } : {}}
            />
            {senhaError && <span style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '-4px' }}>{senhaError}</span>}
          </label>
          {(erro || message) && <div className="alert">{erro || message}</div>}
          <button className="primary-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}

function ItensPedidoEditor({ itens, setItens }) {
  function atualizarItem(index, field, value) {
    setItens((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: field === 'quantidade' ? Number(value) : value } : item
      )
    );
  }

  function removerItem(index) {
    setItens((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <>
      <div className="items-header">
        <h3>Pizzas</h3>
        <button
          type="button"
          className="ghost-button"
          onClick={() => setItens((current) => [...current, { nome: CARDAPIO[0].nome, quantidade: 1 }])}
        >
          <Plus size={18} />
          Adicionar
        </button>
      </div>

      <div className="items-list">
        {itens.map((item, index) => {
          const preco = getPrecoPizza(item.nome);
          const totalItem = preco * Number(item.quantidade || 0);

          return (
            <div className="item-row" key={`${item.nome}-${index}`}>
              <select value={item.nome} onChange={(event) => atualizarItem(index, 'nome', event.target.value)}>
                {CARDAPIO.map((pizza) => (
                  <option key={pizza.nome} value={pizza.nome}>
                    {pizza.nome} - {formatCurrency(pizza.preco)}
                  </option>
                ))}
              </select>
              <input
                min="1"
                step="1"
                inputMode="numeric"
                type="number"
                value={item.quantidade}
                onChange={(event) => atualizarItem(index, 'quantidade', event.target.value)}
              />
              <span className="item-total">{formatCurrency(totalItem)}</span>
              <button
                type="button"
                className="icon-button"
                title="Remover pizza"
                onClick={() => removerItem(index)}
                disabled={itens.length === 1}
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function NovoPedido({ onCreated, onNavigate }) {
  const [cliente, setCliente] = useState('');
  const [itens, setItens] = useState([{ nome: CARDAPIO[0].nome, quantidade: 1 }]);
  const [erro, setErro] = useState('');
  const [modalSucesso, setModalSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const subtotal = calcularSubtotal(itens);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    const itensValidos = normalizarItens(itens);
    const erroPedido = validarPedido(cliente, itensValidos);

    if (erroPedido) {
      setErro(erroPedido);
      return;
    }

    setLoading(true);

    try {
      await api.criarPedido({
        cliente: cliente.trim(),
        itens: itensValidos
      });
      setCliente('');
      setItens([{ nome: CARDAPIO[0].nome, quantidade: 1 }]);
      onCreated();
      setModalSucesso(true);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="workspace-section">
      {modalSucesso && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" style={{ width: '400px', padding: '30px', textAlign: 'center' }} role="dialog">
            <h2 style={{ color: 'var(--success)' }}>Pedido Criado com Sucesso!</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>O pedido foi adicionado a fila e ja esta no Dashboard.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="ghost-button" onClick={() => setModalSucesso(false)}>Novo Pedido</button>
              <button className="primary-button" onClick={() => onNavigate('dashboard')}>Ir para Dashboard</button>
            </div>
          </section>
        </div>
      )}

      <div className="section-heading">
        <div>
          <span>Novo Pedido</span>
          <h2>Monte o pedido do cliente</h2>
        </div>
      </div>

      <div className="order-layout">
        <form className="order-form" onSubmit={handleSubmit}>
          <label>
            Cliente
            <input
              value={cliente}
              onChange={(event) => setCliente(event.target.value)}
              placeholder="Nome do cliente"
              required
            />
          </label>

          <ItensPedidoEditor itens={itens} setItens={setItens} />

          <div className="form-total">
            <span>Total estimado</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          {erro && <div className="alert">{erro}</div>}

          <button className="primary-button form-submit" disabled={loading || itens.length === 0} title={itens.length === 0 ? "O pedido deve conter pelo menos um item." : ""}>
            <Send size={18} />
            {loading ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </form>

        <aside className="menu-summary">
          <h3>Cardapio</h3>
          {CARDAPIO.map((pizza) => (
            <div className="menu-line" key={pizza.nome}>
              <span>{pizza.nome}</span>
              <strong>{formatCurrency(pizza.preco)}</strong>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function EditarPedidoModal({ pedido, onClose, onSaved }) {
  const [cliente, setCliente] = useState(pedido.cliente || '');
  const [itens, setItens] = useState(
    pedido.itens?.length ? pedido.itens.map((item) => ({ nome: item.nome, quantidade: item.quantidade })) : []
  );
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const pedidoId = getPedidoId(pedido);
  const subtotal = calcularSubtotal(itens);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!pedidoId) {
      setErro('Pedido sem id valido.');
      return;
    }

    if (pedido.status !== 'recebido') {
      setErro('Apenas pedidos recebidos podem ser editados.');
      return;
    }

    const itensValidos = normalizarItens(itens);
    const erroPedido = validarPedido(cliente, itensValidos);

    if (erroPedido) {
      setErro(erroPedido);
      return;
    }

    setLoading(true);

    try {
      await api.editarPedido(pedidoId, {
        cliente: cliente.trim(),
        itens: itensValidos
      });
      await onSaved();
      onClose();
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label="Editar pedido">
        <div className="modal-heading">
          <div>
            <span>Editar Pedido</span>
            <h2>{pedido.cliente}</h2>
          </div>
          <button className="icon-button neutral" type="button" onClick={onClose} title="Fechar">
            <X size={18} />
          </button>
        </div>

        <form className="order-form edit-form" onSubmit={handleSubmit}>
          <label>
            Cliente
            <input
              value={cliente}
              onChange={(event) => setCliente(event.target.value)}
              placeholder="Nome do cliente"
              required
            />
          </label>

          <ItensPedidoEditor itens={itens} setItens={setItens} />

          <div className="form-total">
            <span>Total estimado</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          {erro && <div className="alert">{erro}</div>}

          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="primary-button form-submit" disabled={loading}>
              <Save size={18} />
              {loading ? 'Salvando...' : 'Salvar alteracoes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PedidoCard({ pedido, onRefresh }) {
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [editando, setEditando] = useState(false);
  const pedidoId = getPedidoId(pedido);
  const statusIndex = STATUS_FLOW.indexOf(pedido.status);
  const nextStatus = STATUS_FLOW[statusIndex + 1];
  const podeEditar = pedido.status === 'recebido';

  async function avancar() {
    setErro('');
    setSucesso('');

    if (!pedidoId) {
      setErro('Pedido sem id valido.');
      return;
    }

    if (!nextStatus) {
      setErro('Este pedido nao pode avancar de status.');
      return;
    }

    setLoadingAction(true);

    try {
      await api.avancarStatus(pedidoId, nextStatus);
      setSucesso('Status atualizado com sucesso');
      setTimeout(() => setSucesso(''), 3000);
      await onRefresh();
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoadingAction(false);
    }
  }

  async function cancelar() {
    setErro('');
    setSucesso('');

    if (!pedidoId) {
      setErro('Pedido sem id valido.');
      return;
    }

    if (pedido.status !== 'recebido') {
      setErro('Apenas pedidos recebidos podem ser cancelados.');
      return;
    }

    setLoadingAction(true);

    try {
      await api.cancelarPedido(pedidoId);
      await onRefresh();
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoadingAction(false);
    }
  }

  return (
    <>
      <article className="pedido-card">
        <div className="pedido-topline">
          <strong>{pedido.cliente}</strong>
          <span>{formatCurrency(pedido.total)}</span>
        </div>
        <ul>
          {pedido.itens?.map((item, index) => (
            <li key={`${pedidoId}-${item.nome}-${index}`}>
              {item.quantidade}x {item.nome}
            </li>
          ))}
        </ul>
        {erro && <div className="inline-error">{erro}</div>}
        {sucesso && <div className="success" style={{ marginBottom: '10px', fontSize: '0.82rem', padding: '9px 10px' }}>{sucesso}</div>}
        <div className="pedido-actions">
          {podeEditar && (
            <button className="edit-button" type="button" onClick={() => setEditando(true)} disabled={loadingAction}>
              <Pencil size={15} />
              Editar
            </button>
          )}
          {nextStatus && (
            <button className="small-button" onClick={avancar} disabled={loadingAction}>
              {loadingAction ? 'Atualizando...' : `Avancar para ${STATUS_LABELS[nextStatus]}`}
            </button>
          )}
          {pedido.status === 'recebido' && (
            <button className="danger-button" onClick={cancelar} title="Cancelar pedido" disabled={loadingAction}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </article>

      {editando && <EditarPedidoModal pedido={pedido} onClose={() => setEditando(false)} onSaved={onRefresh} />}
    </>
  );
}

export function Dashboard({ pedidos, loading, erro, onRefresh }) {
  const pedidosPorStatus = useMemo(() => {
    return STATUS_ATIVOS.reduce((acc, status) => {
      acc[status] = pedidos.filter((pedido) => pedido.status === status);
      return acc;
    }, {});
  }, [pedidos]);
  const totalAtivos = pedidos.filter((pedido) => STATUS_ATIVOS.includes(pedido.status)).length;
  const totalEntregues = pedidos.filter((pedido) => pedido.status === 'entregue').length;

  return (
    <section className="workspace-section">
      <div className="section-heading">
        <div>
          <span>Dashboard</span>
          <h2>Fila de atendimento</h2>
        </div>
        <button className="ghost-button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px' }}>
          <div style={{ fontSize: '1.2rem' }}>Não foi possível carregar a fila de pedidos.</div>
          <button className="ghost-button" onClick={onRefresh} style={{ background: 'var(--white)' }}>
            Tentar Novamente
          </button>
        </div>
      )}

      {!erro && (
        <>
          <div className="metrics-row">
            <div className="metric-tile">
              <span>Ativos</span>
              <strong>{totalAtivos}</strong>
            </div>
            <div className="metric-tile">
              <span>Recebidos</span>
              <strong>{pedidosPorStatus.recebido?.length || 0}</strong>
            </div>
            <div className="metric-tile">
              <span>Entregues</span>
              <strong>{totalEntregues}</strong>
            </div>
          </div>

          <div className="kanban active-kanban">
            {STATUS_ATIVOS.map((status) => (
              <div className="kanban-column" key={status}>
                <div className="column-title">
                  <span>{STATUS_LABELS[status]}</span>
                  <strong>{pedidosPorStatus[status]?.length || 0}</strong>
                </div>
                <div className="column-body">
                  {loading && <div className="empty-state">Carregando...</div>}
                  {!loading && pedidosPorStatus[status]?.length === 0 && (
                    <div className="empty-state">Sem pedidos aqui.</div>
                  )}
                  {!loading &&
                    pedidosPorStatus[status]?.map((pedido) => (
                      <PedidoCard key={getPedidoId(pedido)} pedido={pedido} onRefresh={onRefresh} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function Historico({ pedidos, loading, erro, onRefresh }) {
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;
  
  const entregues = useMemo(() => {
    return pedidos
      .filter((pedido) => pedido.status === 'entregue' || pedido.status === 'cancelado')
      .sort((a, b) => new Date(getPedidoCreatedAt(b)) - new Date(getPedidoCreatedAt(a)));
  }, [pedidos]);

  const entreguesPaginados = entregues.slice(0, pagina * itensPorPagina);
  const temMaisItens = entregues.length > entreguesPaginados.length;

  return (
    <section className="workspace-section">
      <div className="section-heading">
        <div>
          <span>Historico</span>
          <h2>Pedidos entregues</h2>
        </div>
        <button className="ghost-button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px' }}>
          <div style={{ fontSize: '1.2rem' }}>Erro ao carregar o histórico.</div>
          <button className="ghost-button" onClick={onRefresh} style={{ background: 'var(--white)' }}>
            Tentar novamente
          </button>
        </div>
      )}

      {!erro && (
        <div className="history-table">
          <div className="history-row history-head">
            <span>Cliente</span>
            <span>Itens</span>
            <span>Total</span>
            <span>Criado em</span>
          </div>
          {loading && entregues.length === 0 && <div className="empty-state">Carregando historico...</div>}
          {!loading && entregues.length === 0 && (
             <div className="empty-state" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
               Nenhum histórico de pedidos registrado até o momento.
             </div>
          )}
          {entreguesPaginados.map((pedido) => (
              <div className="history-row" key={getPedidoId(pedido)}>
                <strong>{pedido.cliente}</strong>
                <span>{pedido.itens?.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}</span>
                <strong>{formatCurrency(pedido.total)}</strong>
                <span>{formatDateTime(getPedidoCreatedAt(pedido))}</span>
              </div>
          ))}
          {temMaisItens && (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
               <button className="ghost-button" onClick={() => setPagina(p => p + 1)}>
                 Carregar mais itens
               </button>
             </div>
          )}
        </div>
      )}
    </section>
  );
}

function Configuracoes({ pedidos }) {
  const totalPedidos = pedidos.length;
  const pedidosAtivos = pedidos.filter((pedido) => pedido.status !== 'entregue').length;

  return (
    <section className="workspace-section">
      <div className="section-heading">
        <div>
          <span>Configuracoes</span>
          <h2>Operacao da PizzaFlow</h2>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-panel">
          <h3>Integracao</h3>
          <div className="settings-line">
            <span>API conectada</span>
            <strong>{API_URL}</strong>
          </div>
          <div className="settings-line">
            <span>Autenticacao</span>
            <strong>JWT Bearer Token</strong>
          </div>
        </div>

        <div className="settings-panel">
          <h3>Resumo</h3>
          <div className="settings-line">
            <span>Pedidos ativos</span>
            <strong>{pedidosAtivos}</strong>
          </div>
          <div className="settings-line">
            <span>Total carregado</span>
            <strong>{totalPedidos}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [autenticado, setAutenticado] = useState(Boolean(getToken()));
  const [view, setView] = useState('dashboard');
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function carregarPedidos() {
    if (!getToken()) return;
    setLoading(true);
    setErro('');

    try {
      const data = await api.listarPedidos();
      setPedidos(Array.isArray(data) ? data : data.pedidos || []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autenticado) {
      carregarPedidos();
    }
  }, [autenticado]);

  useEffect(() => {
    function handleUnauthorized() {
      setAutenticado(false);
      setPedidos([]);
      setErro('Sua sessao expirou. Faca login novamente.');
    }

    window.addEventListener('pizzaflow:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('pizzaflow:unauthorized', handleUnauthorized);
  }, []);

  function sair() {
    clearToken();
    setAutenticado(false);
    setPedidos([]);
  }

  if (!autenticado) {
    return (
      <Login
        message={erro}
        onLogin={() => {
          setErro('');
          setAutenticado(true);
        }}
      />
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark compact">
            <ChefHat size={24} />
          </div>
          <div>
            <strong>PizzaFlow</strong>
            <span>Central de pedidos</span>
          </div>
        </div>

        <nav>
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
            <ClipboardList size={22} />
            Pedidos
          </button>
          <button className={view === 'novo' ? 'active' : ''} onClick={() => setView('novo')}>
            <Utensils size={22} />
            Novo pedido
          </button>
          <button className={view === 'historico' ? 'active' : ''} onClick={() => setView('historico')}>
            <History size={22} />
            Historico
          </button>
          <button className={view === 'configuracoes' ? 'active' : ''} onClick={() => setView('configuracoes')}>
            <Settings size={22} />
            Configuracoes
          </button>
        </nav>

        <button className="logout-button" onClick={sair}>
          <LogOut size={22} />
          Sair
        </button>
      </aside>

      <div className="content">
        {view === 'dashboard' && (
          <Dashboard pedidos={pedidos} loading={loading} erro={erro} onRefresh={carregarPedidos} />
        )}
        {view === 'novo' && <NovoPedido onCreated={carregarPedidos} onNavigate={setView} />}
        {view === 'historico' && <Historico pedidos={pedidos} erro={erro} loading={loading} onRefresh={carregarPedidos} />}
        {view === 'configuracoes' && <Configuracoes pedidos={pedidos} />}
      </div>
    </main>
  );
}
