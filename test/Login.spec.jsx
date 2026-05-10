import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../src/App';
import { api, setToken } from '../src/api/client';

// Mock do client da API
vi.mock('../src/api/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: {
      login: vi.fn(),
    },
    setToken: vi.fn(),
  };
});

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CT-FE-LOGIN-001 - erro campos vazios', async () => {
    render(<Login onLogin={() => {}} />);
    
    // Limpa os campos que vem preenchidos por padrão no componente
    const emailInput = screen.getByLabelText(/Email/i);
    const senhaInput = screen.getByLabelText(/Senha/i);
    
    await userEvent.clear(emailInput);
    await userEvent.clear(senhaInput);
    
    // Tenta submeter
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    
    // API não deve ser chamada
    expect(api.login).not.toHaveBeenCalled();
    
    // Mensagens de erro inline devem aparecer
    const errorMessages = screen.getAllByText('Campo obrigatorio');
    expect(errorMessages).toHaveLength(2);
  });

  it('CT-FE-LOGIN-002 - loading', async () => {
    api.login.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    
    render(<Login onLogin={() => {}} />);
    
    const senhaInput = screen.getByLabelText(/Senha/i);
    await userEvent.type(senhaInput, 'senha123');
    
    const button = screen.getByRole('button', { name: /Entrar/i });
    fireEvent.click(button);
    
    // Verifica se botão mudou para estado de loading
    expect(screen.getByRole('button', { name: /Entrando.../i })).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    // Aguarda conclusão para não vazar promessas
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it('CT-FE-LOGIN-003 - erro 401 (mensagem correta)', async () => {
    api.login.mockRejectedValue(new Error('Email ou senha invalidos.'));
    
    render(<Login onLogin={() => {}} />);
    
    const senhaInput = screen.getByLabelText(/Senha/i);
    await userEvent.type(senhaInput, 'senha-errada');
    
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    
    // Espera a mensagem de erro exata da API aparecer no alerta principal
    await waitFor(() => {
      expect(screen.getByText('Email ou senha invalidos.')).toBeInTheDocument();
    });
    
    // Verifica se a senha foi limpa
    expect(senhaInput).toHaveValue('');
    // Verifica se o foco voltou para a senha
    expect(senhaInput).toHaveFocus();
  });

  it('CT-FE-LOGIN-004 - sucesso (salva token + redireciona)', async () => {
    api.login.mockResolvedValue({ token: 'fake-jwt-token' });
    const onLoginMock = vi.fn();
    
    render(<Login onLogin={onLoginMock} />);
    
    const senhaInput = screen.getByLabelText(/Senha/i);
    await userEvent.type(senhaInput, 'senha-correta');
    
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    
    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith('fake-jwt-token');
      expect(onLoginMock).toHaveBeenCalled();
    });
  });
});
