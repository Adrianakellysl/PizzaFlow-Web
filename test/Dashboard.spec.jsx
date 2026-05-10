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
      cancelarPedido: vi.fn(),
    },
  };
});

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPedidos = [
    { id: 1, cliente: 'João', status: 'recebido', total: 50, itens: [] },
  ];

  it('CT-FE-DASH-001 - loading + renderização', () => {
    const { rerender } = render(<Dashboard pedidos={[]} loading={true} erro="" onRefresh={() => {}} />);
    
    // Verifica estado de loading
    const loadingStates = screen.getAllByText('Carregando...');
    expect(loadingStates.length).toBeGreaterThan(0);
    
    // Após carregamento
    rerender(<Dashboard pedidos={mockPedidos} loading={false} erro="" onRefresh={() => {}} />);
    
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
  });

  it('CT-FE-DASH-002 - estado vazio', () => {
    render(<Dashboard pedidos={[]} loading={false} erro="" onRefresh={() => {}} />);
    
    // As 3 colunas ativas devem exibir "Sem pedidos aqui."
    const emptyStates = screen.getAllByText('Sem pedidos aqui.');
    expect(emptyStates.length).toBe(3);
  });

  it('CT-FE-DASH-003 - erro ao carregar', () => {
    const onRefreshMock = vi.fn();
    render(<Dashboard pedidos={[]} loading={false} erro="Erro 500 Interno" onRefresh={onRefreshMock} />);
    
    expect(screen.getByText('Não foi possível carregar a fila de pedidos.')).toBeInTheDocument();
    
    // Clicar em Tentar Novamente
    fireEvent.click(screen.getByRole('button', { name: /Tentar Novamente/i }));
    expect(onRefreshMock).toHaveBeenCalled();
  });

  it('CT-FE-DASH-004 - atualizar status (sucesso e erro)', async () => {
    const onRefreshMock = vi.fn();
    render(<Dashboard pedidos={mockPedidos} loading={false} erro="" onRefresh={onRefreshMock} />);
    
    // Simula sucesso
    api.avancarStatus.mockResolvedValueOnce({});
    
    const avancarButton = screen.getByRole('button', { name: /Avancar para Preparando/i });
    fireEvent.click(avancarButton);
    
    // Loading interno do botão
    expect(screen.getByText('Atualizando...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Status atualizado com sucesso')).toBeInTheDocument();
      expect(onRefreshMock).toHaveBeenCalled();
    });
    
    // Simula Erro 
    api.avancarStatus.mockRejectedValueOnce(new Error('Erro na API de Status'));
    fireEvent.click(screen.getByRole('button', { name: /Avancar para Preparando/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Erro na API de Status')).toBeInTheDocument();
    });
  });
});
