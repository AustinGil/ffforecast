import { faker } from '@faker-js/faker';

describe('My First Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('is accessible', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
  it('Has the app title as h1', () => {
    cy.get('h1').should('have.text', "Freakin' Fast Forecast");
  });
  it('Has the 3 main sections', () => {
    cy.get('section h3').contains('Current').should('exist');
    cy.get('section h3').contains('Hourly').should('exist');
    cy.get('section h3').contains('Daily').should('exist');
  });
  it('Updates the location from the user query', () => {
    const cityState = `${faker.address.city()}, ${faker.address.state()}`;
    cy.get('input[name="location"]').type(`${cityState}{enter}`);
    cy.get(`:contains(Weather for ${cityState})`).should('exist');
  });
  it.only('updates the cookies with the new location', () => {
    const cityState = `${faker.address.city()}, ${faker.address.state()}`;

    cy.getCookie('location').should('not.exist');
    cy.get('input[name="location"]').type(`${cityState}{enter}`);
    const cookie = cy.getCookie('location');
    cookie.should('have.property', 'value', cityState);
  });
});
