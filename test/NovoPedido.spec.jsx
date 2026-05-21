import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NovoPedido } from '../src/App';
import { api } from '../src/api/client';

vi.mock('../src/api/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: {
      criarPedido: vi.fn()
    }
  };
});

describe('NovoPedido', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CT-FE-PED-001 - Deve bloquear envio quando cliente nao for informado', () => {
    render(<NovoPedido onCreated={() => {}} onNavigate={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Enviar pedido/i }));

    expect(api.criarPedido).not.toHaveBeenCalled();
  });

  it('CT-FE-PED-002 - Deve recalcular total estimado quando adicionar item ao pedido', () => {
    render(<NovoPedido onCreated={() => {}} onNavigate={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    expect(screen.getByText('R$ 90,00')).toBeInTheDocument();
  });

  it('CT-FE-PED-003 - Deve exibir loading e mensagem quando API retornar erro ao criar pedido', async () => {
    api.criarPedido.mockRejectedValueOnce(new Error('Erro no servidor interno.'));

    render(<NovoPedido onCreated={() => {}} onNavigate={() => {}} />);

    await userEvent.type(screen.getByPlaceholderText('Nome do cliente'), 'Marcos');

    fireEvent.click(screen.getByRole('button', { name: /Enviar pedido/i }));

    expect(screen.getByRole('button', { name: /Enviando.../i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Erro no servidor interno.')).toBeInTheDocument();
    });
  });

  it('CT-FE-PED-004 - Deve exibir modal de sucesso quando pedido for criado', async () => {
    api.criarPedido.mockResolvedValueOnce({});
    const onCreatedMock = vi.fn();
    const onNavigateMock = vi.fn();

    render(<NovoPedido onCreated={onCreatedMock} onNavigate={onNavigateMock} />);

    await userEvent.type(screen.getByPlaceholderText('Nome do cliente'), 'Joao da Silva');

    fireEvent.click(screen.getByRole('button', { name: /Enviar pedido/i }));

    await waitFor(() => {
      expect(onCreatedMock).toHaveBeenCalled();
      expect(screen.getByText('Pedido Criado com Sucesso!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Ir para Dashboard/i }));
    expect(onNavigateMock).toHaveBeenCalledWith('dashboard');
  });
});
