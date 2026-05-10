import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Historico } from '../src/App';

describe('Historico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPedidos = [
    { id: 1, cliente: 'João', status: 'entregue', total: 50, itens: [{ nome: 'Pizza Calabresa', quantidade: 1 }], createdAt: new Date().toISOString() },
    { id: 2, cliente: 'Maria', status: 'cancelado', total: 40, itens: [{ nome: 'Pizza Mussarela', quantidade: 1 }], createdAt: new Date(Date.now() - 10000).toISOString() },
  ];

  it('CT-FE-HIST-001 - estado vazio', () => {
    render(<Historico pedidos={[]} loading={false} erro="" onRefresh={() => {}} />);
    
    expect(screen.getByText('Nenhum histórico de pedidos registrado até o momento.')).toBeInTheDocument();
  });

  it('CT-FE-HIST-002 - erro de carregamento', () => {
    const onRefreshMock = vi.fn();
    render(<Historico pedidos={[]} loading={false} erro="Falha na rede" onRefresh={onRefreshMock} />);
    
    expect(screen.getByText('Erro ao carregar o histórico.')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));
    expect(onRefreshMock).toHaveBeenCalled();
  });

  it('CT-FE-HIST-003 - listagem e ordenação', () => {
    render(<Historico pedidos={mockPedidos} loading={false} erro="" onRefresh={() => {}} />);
    
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
    
    // Testa se o cardápio formatou corretamente os itens do João
    expect(screen.getByText('1x Pizza Calabresa')).toBeInTheDocument();
  });

  it('CT-FE-HIST-004 - paginação', () => {
    // Cria 15 pedidos mockados
    const muitosPedidos = Array.from({ length: 15 }).map((_, index) => ({
      id: index + 1,
      cliente: `Cliente ${index + 1}`,
      status: 'entregue',
      total: 50,
      itens: [],
      createdAt: new Date().toISOString(),
    }));

    render(<Historico pedidos={muitosPedidos} loading={false} erro="" onRefresh={() => {}} />);
    
    // Na primeira página (10 itens), o Cliente 11 não deve estar visível
    expect(screen.queryByText('Cliente 11')).not.toBeInTheDocument();
    
    // O botão "Carregar mais itens" deve aparecer
    const btnLoadMore = screen.getByRole('button', { name: /Carregar mais itens/i });
    expect(btnLoadMore).toBeInTheDocument();
    
    // Simula clique de paginação
    fireEvent.click(btnLoadMore);
    
    // Após clicar, os 5 restantes devem aparecer, incluindo o Cliente 11
    expect(screen.getByText('Cliente 11')).toBeInTheDocument();
  });
});
