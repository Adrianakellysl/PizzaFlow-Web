# PizzaFlow Frontend

Interface web em React para atendimento e acompanhamento de pedidos da API PizzaFlow.

## Descricao

O frontend permite login, criacao de pedidos, acompanhamento da fila em Kanban, edicao de pedidos elegiveis, avanco de status, cancelamento/exclusao quando permitido e consulta do historico.

O sistema consome a API REST configurada em `VITE_API_URL` e usa JWT salvo no `localStorage` para autenticar as rotas protegidas.

## Tecnologias

- React
- Vite
- CSS customizado
- Fetch API
- Lucide React
- Vitest
- React Testing Library
- Cypress

## Como Rodar Localmente

### 1. Pre-requisitos

- Node.js instalado
- Backend PizzaFlow rodando
- API disponivel em `http://localhost:3000/api` ou em outra URL configurada no `.env`

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar ambiente

Crie um arquivo `.env` na raiz do frontend ou copie o `.env.example`.

```bash
VITE_API_URL=http://localhost:3000/api
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Por padrao, o Vite exibira uma URL local como `http://localhost:5173`.

### 5. Rodar testes unitarios

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

## Integracao com a API

Base URL padrao:

```text
http://localhost:3000/api
```

Endpoints consumidos:

| Acao | Metodo e rota |
|---|---|
| Login | `POST /login` |
| Listar pedidos | `GET /pedidos` |
| Criar pedido | `POST /pedidos` |
| Editar pedido | `PUT /pedidos/:id` |
| Avancar status | `PATCH /pedidos/:id/status` |
| Cancelar/excluir pedido | `DELETE /pedidos/:id` |

Rotas de pedidos enviam:

```text
Authorization: Bearer <token>
```

## Regras de Negocio no Frontend

- Login exige email e senha preenchidos.
- O token JWT retornado pela API e salvo no `localStorage`.
- Ao receber `401`, o frontend limpa o token e retorna para a tela de login.
- O frontend envia apenas `cliente` e `itens` ao criar ou editar pedido.
- O preco exibido no formulario e apenas uma estimativa visual.
- O backend e a fonte da verdade para precos, validacoes e total final.
- Pedido so pode ser editado quando estiver com status `recebido`.
- Cancelamento/exclusao so fica disponivel para pedido com status `recebido`.
- O Kanban exibe apenas pedidos ativos: `recebido`, `preparando` e `pronto`.
- O historico exibe pedidos `entregue` e `cancelado`, sem alterar regras de cancelamento.
- Status seguem o fluxo `recebido -> preparando -> pronto -> entregue`.

## Funcionalidades

- Tela de login.
- Dashboard Kanban por status ativo.
- Criacao de pedido com itens e quantidades.
- Exibicao de total estimado antes do envio.
- Edicao de pedido recebido.
- Avanco sequencial de status.
- Cancelamento/exclusao de pedido recebido.
- Historico de pedidos entregues e cancelados.
- Tela de configuracoes com URL da API e resumo dos pedidos carregados.
- Tratamento visual de erros, loading e sessao expirada.

## Estrutura

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

## Checklist de Producao

- Configurar `VITE_API_URL` para a URL real da API.
- Rodar `npm test`.
- Rodar `npm run build`.
- Publicar o conteudo gerado em `dist/`.
- Garantir que a API aceite CORS para o dominio do frontend.
- Servir a aplicacao com HTTPS em ambiente publico.
