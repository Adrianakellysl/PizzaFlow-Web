describe('Tela de Pedidos', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/pedidos', {
      statusCode: 200,
      body: {
        pedidos: [
          {
            id: '1',
            cliente: 'Joao Mock',
            status: 'recebido',
            total: 45,
            itens: [{ nome: 'Pizza Calabresa', quantidade: 1 }],
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            cliente: 'Maria Mock',
            status: 'preparando',
            total: 50,
            itens: [{ nome: 'Pizza Frango com Catupiry', quantidade: 1 }],
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getPedidos');

    cy.login();
    cy.wait('@getPedidos');
  });

  it('CT-FE-DASH-E2E-001 - Deve exibir pedidos nas colunas corretas do Kanban', () => {
    cy.contains('h2', 'Fila de atendimento').should('be.visible');
    cy.contains('Recebido').should('be.visible');
    cy.contains('Preparando').should('be.visible');
    cy.contains('Pronto').should('be.visible');
    cy.contains('Joao Mock').should('be.visible');
    cy.contains('Maria Mock').should('be.visible');

    cy.contains('article', 'Joao Mock').within(() => {
      cy.get('button.edit-button').should('be.visible');
      cy.get('button.danger-button').should('be.visible');
    });

    cy.contains('article', 'Maria Mock').within(() => {
      cy.get('button.edit-button').should('not.exist');
      cy.get('button.danger-button').should('not.exist');
    });
  });

  it('CT-FE-DASH-E2E-002 - Deve avancar status quando pedido estiver como recebido', () => {
    cy.intercept('PATCH', '**/pedidos/1/status', {
      statusCode: 200,
      body: { message: 'Status atualizado com sucesso' }
    }).as('avancarStatus');

    cy.intercept('GET', '**/pedidos', {
      statusCode: 200,
      body: {
        pedidos: [
          {
            id: '1',
            cliente: 'Joao Mock',
            status: 'preparando',
            total: 45,
            itens: [{ nome: 'Pizza Calabresa', quantidade: 1 }],
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getPedidosAtualizados');

    cy.contains('article', 'Joao Mock').contains('button', 'Avancar para Preparando').click();
    cy.wait('@avancarStatus');
    cy.wait('@getPedidosAtualizados');

    cy.contains('button', 'Avancar para Pronto').should('be.visible');
  });

  it('CT-FE-DASH-E2E-003 - Deve permitir edicao apenas quando pedido estiver como recebido', () => {
    cy.intercept('PUT', '**/pedidos/1', {
      statusCode: 200,
      body: { message: 'Pedido atualizado' }
    }).as('editarPedido');

    cy.contains('article', 'Joao Mock').contains('button', 'Editar').click();
    cy.get('.modal-panel').should('be.visible');
    cy.get('.modal-panel input[placeholder="Nome do cliente"]').clear().type('Joao Editado');
    cy.get('.modal-panel button.form-submit').click();

    cy.wait('@editarPedido');
    cy.get('.modal-panel').should('not.exist');
  });

  it('CT-FE-DASH-E2E-004 - Deve permitir cancelamento apenas quando pedido estiver como recebido', () => {
    cy.intercept('DELETE', '**/pedidos/1', {
      statusCode: 200,
      body: { message: 'Pedido cancelado' }
    }).as('cancelarPedido');

    cy.intercept('GET', '**/pedidos', {
      statusCode: 200,
      body: { pedidos: [] }
    }).as('getPedidosVazio');

    cy.contains('article', 'Joao Mock').find('button.danger-button').click();
    cy.wait('@cancelarPedido');
    cy.wait('@getPedidosVazio');

    cy.contains('Joao Mock').should('not.exist');
  });
});
