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

- React + Vite
- CSS customizado
- Fetch API
- JWT (autenticação)

---

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Confira a URL da API em `.env`:

```bash
VITE_API_URL=http://localhost:3000/api
```

3. Inicie o frontend:

```bash
npm run dev
```

O login usa o endpoint `POST /api/login` e salva o token JWT no `localStorage`.
---

## Autenticação

### Regras
- Email e senha obrigatórios
- Validação de formato de email
- Token salvo no navegador

### Comportamento
- Sucesso → redireciona para dashboard
- Erro → mensagens amigáveis

---

## Proteção de Rotas

- Rotas protegidas:
  - /dashboard
  - /pedidos

- Sem token → redireciona para login

---

## Criação de Pedido

### Validações
- Cliente obrigatório
- Lista de itens obrigatória
- Quantidade > 0

### Regras
- Preço NÃO é enviado
- Total calculado apenas para exibição

---

## Edição de Pedido

- Permitida apenas se status = recebido

---

## Atualização de Status

Fluxo permitido:

recebido → preparando → pronto → entregue

### Regras
- Não pode pular etapas
- Não pode voltar status

---

## Exclusão de Pedido

- Permitido apenas se status = recebido
- Confirmação obrigatória antes de excluir

---

## Listagem de Pedidos

- Exibição em formato Kanban
- Atualização automática após ações

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

---

## Evolução futura

- Integração com pagamentos
- Dashboard com métricas
- Notificações em tempo real
- Responsividade avançada

---

## Observação

O frontend segue as regras de negócio definidas pela API, garantindo consistência entre interface e backend.