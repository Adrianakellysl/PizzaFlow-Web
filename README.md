# PizzaFlow WEB

Interface web para gerenciamento de pedidos integrada à API PizzaFlow.

## Objetivo

Fornecer uma interface intuitiva para:

- Criar pedidos
- Editar pedidos
- Atualizar status
- Excluir pedidos
- Visualizar fluxo em tempo real (Kanban)

---

## Preview
<p align="center">
  <img 
    src="https://raw.githubusercontent.com/Adrianakellysl/PizzaFlow-Web/main/docs/login.png" 
    width="800"
  />


## Tecnologias

- **React + Vite**
- **CSS customizado**
- **Fetch API**
- **JWT** (autenticação)
- **Lucide React
- **Vitest & React Testing Library** (Testes automatizados)
- **Cypress

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

## 5. Rodar testes unitarios

```bash
npm test
```

### 6. Rodar testes E2E

Com o frontend rodando:

```bash
npm run test:e2e
```

Para abrir a interface do Cypress:

```bash
npm run test:e2e:open
```

> **Nota sobre o Login:**
> O login se comunica com o endpoint `POST /api/login` e, em caso de sucesso, salva o token JWT no `localStorage` do navegador para manter a sessão ativa durante as requisições subsequentes.

---

## Autenticação

### Regras
- Email e senha obrigatórios
- Validação de formato de email
- Token salvo no navegador

## Acesso para Testes

Utilize as credenciais abaixo para testar a aplicação:

- Email: admin@pizzaria.com  
- Senha: 123456

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

---

## Listagem de Pedidos

- Exibição em formato Kanban (colunas separadas e baseadas nos status do pedido).
- Atualização automática da lista após realizar qualquer ação (criar, excluir ou avançar status).
- Histórico exibe pedidos com status `cancelado` ou `entregue`.

---

## Estrutura do Projeto

```text
src/
  api/
    client.js
  App.jsx
  main.jsx
  styles.css

test/
  Dashboard.spec.jsx
  Historico.spec.jsx
  Login.spec.jsx
  NovoPedido.spec.jsx
  setup.js

cypress/
  e2e/
  support/

index.html
vite.config.js
cypress.config.js
package.json
.env.example
```

---

## Evolução futura

- Dashboard com métricas (gráficos)
- Notificações em tempo real (via WebSocket)
- Responsividade avançada para uso em dispositivos móveis

---

## Observação

O frontend segue as regras de negócio definidas pela API, garantindo consistência total entre a interface web e as restrições do backend.
