import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../src/App';
import { api, setToken } from '../src/api/client';

vi.mock('../src/api/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: {
      login: vi.fn()
    },
    setToken: vi.fn()
  };
});

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CT-FE-LOGIN-001 - Deve bloquear login quando email e senha estiverem vazios', async () => {
    render(<Login onLogin={() => {}} />);

    await userEvent.clear(screen.getByLabelText(/Email/i));
    await userEvent.clear(screen.getByLabelText(/Senha/i));

    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    expect(api.login).not.toHaveBeenCalled();
    expect(screen.getAllByText('Campo obrigatorio')).toHaveLength(2);
  });

  it('CT-FE-LOGIN-002 - Deve exibir loading e desabilitar o botao durante a autenticacao', async () => {
    api.login.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<Login onLogin={() => {}} />);

    const senhaInput = screen.getByLabelText(/Senha/i);
    await userEvent.type(senhaInput, 'senha123');

    const button = screen.getByRole('button', { name: /Entrar/i });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: /Entrando.../i })).toBeInTheDocument();
    expect(button).toBeDisabled();

    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it('CT-FE-LOGIN-003 - Deve exibir erro e limpar senha quando credenciais forem invalidas', async () => {
    api.login.mockRejectedValue(new Error('Email ou senha invalidos.'));

    render(<Login onLogin={() => {}} />);

    const senhaInput = screen.getByLabelText(/Senha/i);
    await userEvent.type(senhaInput, 'senha-errada');

    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Email ou senha invalidos.')).toBeInTheDocument();
    });

    expect(senhaInput).toHaveValue('');
    expect(senhaInput).toHaveFocus();
  });

  it('CT-FE-LOGIN-004 - Deve salvar token e autenticar usuario quando login for valido', async () => {
    api.login.mockResolvedValue({ token: 'fake-jwt-token' });
    const onLoginMock = vi.fn();

    render(<Login onLogin={onLoginMock} />);

    await userEvent.type(screen.getByLabelText(/Senha/i), 'senha-correta');

    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith('fake-jwt-token');
      expect(onLoginMock).toHaveBeenCalled();
    });
  });
});
