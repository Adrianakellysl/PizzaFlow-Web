Cypress.Commands.add('login', (email = 'admin@pizzaria.com', senha = '123456') => {
  cy.intercept('POST', '**/login', {
    statusCode: 200,
    body: { token: 'mock-token' }
  }).as('mockLogin');

  cy.visit('/');

  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(senha);
  cy.get('.primary-button').click();

  cy.wait('@mockLogin');
  cy.contains('span', 'Dashboard').should('be.visible');
});
