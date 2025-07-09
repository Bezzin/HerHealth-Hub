// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to wait for API responses
Cypress.Commands.add('waitForAPI', (endpoint) => {
  cy.intercept('GET', endpoint).as('apiCall')
  cy.wait('@apiCall')
})

// Custom command to check for UI v2 elements
Cypress.Commands.add('checkUIV2Elements', () => {
  // Check for teal color scheme elements
  cy.get('[class*="teal"]', { timeout: 10000 }).should('exist')
})

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.wait(1000) // Allow for React hydration
})

// Custom command to select doctor
Cypress.Commands.add('selectFirstDoctor', () => {
  cy.get('[data-testid="doctor-card"]').first().should('be.visible')
  cy.get('[data-testid="book-now-button"]').first().click()
})

// Custom command to fill booking form
Cypress.Commands.add('fillBookingForm', (patientData = {}) => {
  const defaultData = {
    name: 'Test Patient',
    email: 'test@example.com',
    phone: '+447700900123',
    reason: 'Routine consultation'
  }
  
  const data = { ...defaultData, ...patientData }
  
  cy.get('input[name="name"]').clear().type(data.name)
  cy.get('input[name="email"]').clear().type(data.email)
  cy.get('input[name="phone"]').clear().type(data.phone)
  cy.get('textarea[name="reasonForConsultation"]').clear().type(data.reason)
})