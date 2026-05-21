import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Historico } from '../src/App';

describe('Historico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPedidos = [
    {
      id: 1,
      cliente: 'Joao',
      status: 'entregue',
      total: 50,
      itens: [{ nome: 'Pizza Calabresa', quantidade: 1 }],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      cliente: 'Maria',
      status: 'cancelado',
      total: 40,
      itens: [{ nome: 'Pizza Mussarela', quantidade: 1 }],
      createdAt: new Date(Date.now() - 10000).toISOString()
    }
  ];

  it('CT-FE-HIST-001 - Deve exibir estado vazio quando nao houver pedidos no historico', () => {
    render(<Historico pedidos={[]} loading={false} erro="" onRefresh={() => {}} />);

    expect(screen.getByText('Nenhum historico de pedidos registrado ate o momento.')).toBeInTheDocument();
  });

  it('CT-FE-HIST-002 - Deve exibir erro e permitir nova tentativa quando falhar o carregamento', () => {
    const onRefreshMock = vi.fn();
    render(<Historico pedidos={[]} loading={false} erro="Falha na rede" onRefresh={onRefreshMock} />);

    expect(screen.getByText('Erro ao carregar o historico.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));
    expect(onRefreshMock).toHaveBeenCalled();
  });

  it('CT-FE-HIST-003 - Deve listar pedidos entregues e cancelados no historico', () => {
    render(<Historico pedidos={mockPedidos} loading={false} erro="" onRefresh={() => {}} />);

    expect(screen.getByText('Joao')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('Entregue')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
    expect(screen.getByText('1x Pizza Calabresa')).toBeInTheDocument();
  });

  it('CT-FE-HIST-004 - Deve carregar mais itens quando houver paginacao no historico', () => {
    const muitosPedidos = Array.from({ length: 15 }).map((_, index) => ({
      id: index + 1,
      cliente: `Cliente ${index + 1}`,
      status: 'entregue',
      total: 50,
      itens: [],
      createdAt: new Date(Date.now() - index * 1000).toISOString()
    }));

    render(<Historico pedidos={muitosPedidos} loading={false} erro="" onRefresh={() => {}} />);

    expect(screen.queryByText('Cliente 11')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Carregar mais itens/i }));

    expect(screen.getByText('Cliente 11')).toBeInTheDocument();
  });

  it('CT-FE-HIST-005 - Deve ocultar pedidos ativos na tela de historico', () => {
    render(
      <Historico
        pedidos={[
          ...mockPedidos,
          { id: 3, cliente: 'Pedido Recebido', status: 'recebido', total: 45, itens: [], createdAt: new Date().toISOString() },
          { id: 4, cliente: 'Pedido Preparando', status: 'preparando', total: 45, itens: [], createdAt: new Date().toISOString() },
          { id: 5, cliente: 'Pedido Pronto', status: 'pronto', total: 45, itens: [], createdAt: new Date().toISOString() }
        ]}
        loading={false}
        erro=""
        onRefresh={() => {}}
      />
    );

    expect(screen.queryByText('Pedido Recebido')).not.toBeInTheDocument();
    expect(screen.queryByText('Pedido Preparando')).not.toBeInTheDocument();
    expect(screen.queryByText('Pedido Pronto')).not.toBeInTheDocument();
  });
});
