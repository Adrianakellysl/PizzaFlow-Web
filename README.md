# PizzaFlow Frontend

Interface web para gerenciamento de pedidos integrada à API PizzaFlow.

## Objetivo

Fornecer uma interface intuitiva para:

- Criar pedidos
- Editar pedidos
- Atualizar status
- Excluir pedidos
- Visualizar fluxo em tempo real (Kanban)

---

## Tecnologias

- **React + Vite**
- **CSS customizado**
- **Fetch API**
- **JWT** (autenticação)
- **Vitest & React Testing Library** (Testes automatizados)

---

## Como Executar o Sistema

Para rodar a aplicação localmente, siga o passo a passo abaixo:

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** instalado na sua máquina e o banco de dados **MongoDB** rodando (pois é nele que os dados são salvos de fato). Além disso, a **API do PizzaFlow** (backend) também deve estar configurada e rodando localmente na porta 3000.

### 2. Instalação das dependências
Abra o terminal na pasta do projeto frontend e execute:
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
Crie um arquivo chamado `.env` na raiz do projeto (ou copie do `.env.example`). Ele deve conter a URL base da sua API:
```bash
VITE_API_URL=http://localhost:3000/api
```

### 4. Inicialização do Servidor de Desenvolvimento
Inicie o frontend executando o comando:
```bash
npm run dev
```
O terminal mostrará a URL local (geralmente `http://localhost:5173`) onde você poderá acessar a interface pelo navegador.

### 5. Execução de Testes Automatizados (Opcional)
Como o projeto possui uma suíte de testes de interface focada em qualidade (QA), você pode rodá-la usando:
```bash
npm run test
```

> **Nota sobre o Login:**
> O login se comunica com o endpoint `POST /api/login` e, em caso de sucesso, salva o token JWT no `localStorage` do navegador para manter a sessão ativa durante as requisições subsequentes.

---

## Autenticação

### Regras
- Email e senha obrigatórios
- Validação de formato de email
- Token salvo no navegador

### Comportamento
- Sucesso → redireciona para dashboard
- Erro → exibe mensagens amigáveis

---

## Proteção de Rotas

- Rotas protegidas:
  - `/dashboard`
  - `/pedidos`

- Sem token → redireciona automaticamente para o login

---

## Criação de Pedido

### Validações
- Cliente obrigatório
- Lista de itens obrigatória
- Quantidade > 0

### Regras
- Preço NÃO é enviado para a API (o backend se encarrega de validar os valores reais)
- O Total calculado no frontend serve apenas para exibição prévia para o usuário

---

## Edição de Pedido

- Permitida apenas se o status atual for `recebido`.

---

## Atualização de Status

Fluxo permitido:

`recebido` → `preparando` → `pronto` → `entregue`

### Regras
- Não pode pular etapas.
- Não pode voltar status.

---

## Exclusão de Pedido

- Permitida apenas se o status atual for `recebido`.
- Exige uma confirmação obrigatória na tela antes de excluir efetivamente.

---

## Listagem de Pedidos

- Exibição em formato Kanban (colunas separadas e baseadas nos status do pedido).
- Atualização automática da lista após realizar qualquer ação (criar, excluir ou avançar status).

---

## Estrutura do Projeto

```text
src/
  api/            # comunicação com a API (fetch/axios)
  App.jsx         # componente principal
  main.jsx        # ponto de entrada da aplicação
  styles.css      # estilos globais

index.html        # template HTML
.env.example      # exemplo de variáveis de ambiente
vite.config.js    # configuração do Vite
package.json      # dependências e scripts
```

---

## Evolução futura

- Integração com pagamentos
- Dashboard com métricas (gráficos)
- Notificações em tempo real (via WebSocket)
- Responsividade avançada para uso em dispositivos móveis

---

## Observação

O frontend segue as regras de negócio rigorosas definidas pela API, garantindo consistência total entre a interface web e as restrições do backend.