import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dashboard } from '../src/App';
import { api } from '../src/api/client';

vi.mock('../src/api/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: {
      avancarStatus: vi.fn(),
      cancelarPedido: vi.fn()
    }
  };
});

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPedidos = [
    { id: 1, cliente: 'Joao', status: 'recebido', total: 50, itens: [] }
  ];

  it('CT-FE-DASH-001 - Deve exibir loading e renderizar pedidos apos carregamento', () => {
    const { rerender } = render(<Dashboard pedidos={[]} loading erro="" onRefresh={() => {}} />);

    expect(screen.getAllByText('Carregando...').length).toBeGreaterThan(0);

    rerender(<Dashboard pedidos={mockPedidos} loading={false} erro="" onRefresh={() => {}} />);

    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    expect(screen.getByText('Joao')).toBeInTheDocument();
  });

  it('CT-FE-DASH-002 - Deve exibir estado vazio quando nao houver pedidos ativos', () => {
    render(<Dashboard pedidos={[]} loading={false} erro="" onRefresh={() => {}} />);

    expect(screen.getAllByText('Sem pedidos aqui.')).toHaveLength(3);
  });

  it('CT-FE-DASH-003 - Deve exibir erro e permitir nova tentativa quando falhar o carregamento', () => {
    const onRefreshMock = vi.fn();
    render(<Dashboard pedidos={[]} loading={false} erro="Erro 500 Interno" onRefresh={onRefreshMock} />);

    expect(screen.getByText('Nao foi possivel carregar a fila de pedidos.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tentar Novamente/i }));
    expect(onRefreshMock).toHaveBeenCalled();
  });

  it('CT-FE-DASH-004 - Deve avancar status e exibir mensagem quando a API retornar sucesso ou erro', async () => {
    const onRefreshMock = vi.fn();
    render(<Dashboard pedidos={mockPedidos} loading={false} erro="" onRefresh={onRefreshMock} />);

    api.avancarStatus.mockResolvedValueOnce({});

    fireEvent.click(screen.getByRole('button', { name: /Avancar para Preparando/i }));

    expect(screen.getByText('Atualizando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Status atualizado com sucesso')).toBeInTheDocument();
      expect(onRefreshMock).toHaveBeenCalled();
    });

    api.avancarStatus.mockRejectedValueOnce(new Error('Erro na API de Status'));
    fireEvent.click(screen.getByRole('button', { name: /Avancar para Preparando/i }));

    await waitFor(() => {
      expect(screen.getByText('Erro na API de Status')).toBeInTheDocument();
    });
  });
});
