describe('Login', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('CT-FE-LOGIN-E2E-001 - Deve permitir entrada no sistema quando informar credenciais validas', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: { token: 'mock-token' }
    }).as('login');

    cy.intercept('GET', '**/pedidos', {
      statusCode: 200,
      body: { pedidos: [] }
    }).as('getPedidos');

    cy.get('input[type="email"]').clear().type('admin@pizzaria.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('.primary-button').click();

    cy.wait('@login');
    cy.wait('@getPedidos');
    cy.contains('span', 'Dashboard').should('be.visible');
  });

  it('CT-FE-LOGIN-E2E-002 - Deve exibir mensagem de erro quando informar credenciais invalidas', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 401,
      body: { erro: 'Email ou senha invalidos.' }
    }).as('loginInvalido');

    cy.get('input[type="email"]').clear().type('admin@pizzaria.com');
    cy.get('input[type="password"]').type('654321');
    cy.get('.primary-button').click();

    cy.wait('@loginInvalido');
    cy.get('.alert').should('have.text', 'Email ou senha invalidos.');
  });

  it('CT-FE-LOGIN-E2E-003 - Deve impedir login quando email e senha estiverem vazios', () => {
    cy.get('input[type="email"]').clear();
    cy.get('input[type="password"]').clear();
    cy.get('.primary-button').click();

    cy.contains('Campo obrigatorio').should('be.visible');
  });
});
