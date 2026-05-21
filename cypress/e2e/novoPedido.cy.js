describe('Tela de Novo Pedido', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/pedidos', {
      statusCode: 200,
      body: { pedidos: [] }
    }).as('getPedidos');

    cy.login();
    cy.contains('button', 'Novo pedido').click();
    cy.wait('@getPedidos');
  });

  it('CT-FE-PED-E2E-001 - Deve bloquear envio quando cliente nao for informado', () => {
    cy.get('.order-form button.form-submit').click();

    cy.get('input[placeholder="Nome do cliente"]').then(($input) => {
      expect($input[0].checkValidity()).to.equal(false);
    });
  });

  it('CT-FE-PED-E2E-002 - Deve calcular total estimado quando adicionar item ao pedido', () => {
    cy.contains('button', 'Adicionar').click();

    cy.get('.form-total strong').should(($el) => {
      expect($el.text().trim().replace(/\s/g, '')).to.equal('R$90,00');
    });
  });

  it('CT-FE-PED-E2E-003 - Deve criar pedido e exibir modal de sucesso quando dados forem validos', () => {
    cy.intercept('POST', '**/pedidos', {
      statusCode: 201,
      body: { message: 'Pedido criado com sucesso' }
    }).as('criarPedido');

    cy.get('input[placeholder="Nome do cliente"]').type('Cliente Mock');
    cy.get('.order-form button.form-submit').click();

    cy.wait('@criarPedido');
    cy.get('.modal-panel').should('be.visible');
    cy.contains('h2', 'Pedido Criado com Sucesso!').should('be.visible');
  });
});
