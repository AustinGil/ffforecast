describe('My First Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('Has the app title as h1', () => {
    cy.get('h1').should('have.text', "Freakin' Fast Forecast");
  });
  it('Has the 3 main sections', () => {
    cy.get('section h3').contains('Current').should('exist');
    cy.get('section h3').contains('Hourly').should('exist');
    cy.get('section h3').contains('Daily').should('exist');
  });
});
