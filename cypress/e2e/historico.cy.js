describe('Tela de Historico', () => {
  it('CT-FE-HIST-E2E-001 - Deve exibir estado vazio quando nao houver pedidos no historico', () => {
    cy.intercept('GET', '**/pedidos', {
      statusCode: 200,
      body: { pedidos: [] }
    }).as('getPedidos');

    cy.login();
    cy.contains('button', 'Historico').click();
    cy.wait('@getPedidos');

    cy.contains('Nenhum historico de pedidos registrado ate o momento.').should('be.visible');
  });

  it('CT-FE-HIST-E2E-002 - Deve exibir pedidos entregues e cancelados sem listar pedidos ativos', () => {
    cy.intercept('GET', '**/pedidos', {
      statusCode: 200,
      body: {
        pedidos: [
          {
            id: '1',
            cliente: 'Joao Entregue',
            status: 'entregue',
            total: 45,
            itens: [{ nome: 'Pizza Calabresa', quantidade: 1 }],
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            cliente: 'Maria Cancelada',
            status: 'cancelado',
            total: 50,
            itens: [{ nome: 'Pizza Frango com Catupiry', quantidade: 1 }],
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            cliente: 'Pedro Ativo',
            status: 'preparando',
            total: 40,
            itens: [{ nome: 'Pizza Mussarela', quantidade: 1 }],
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getPedidosHistorico');

    cy.login();
    cy.contains('button', 'Historico').click();
    cy.wait('@getPedidosHistorico');

    cy.contains('Joao Entregue').should('be.visible');
    cy.contains('Maria Cancelada').should('be.visible');
    cy.contains('Entregue').should('be.visible');
    cy.contains('Cancelado').should('be.visible');
    cy.contains('Pedro Ativo').should('not.exist');
  });
});
