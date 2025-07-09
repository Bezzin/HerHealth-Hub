describe('Navigation and Routing - UI v2', () => {
  it('should navigate between main pages correctly', () => {
    // Start at home
    cy.visit('/')
    cy.waitForPageLoad()
    
    // Navigate to booking
    cy.get('[data-testid="book-consultation-button"]').click()
    cy.url().should('include', '/booking')
    
    // Navigate to terms
    cy.visit('/terms')
    cy.contains('Terms of Service').should('be.visible')
    cy.contains('England & Wales').should('be.visible')
    
    // Navigate to privacy
    cy.visit('/privacy')
    cy.contains('Privacy Policy').should('be.visible')
    cy.contains('GDPR').should('be.visible')
  })

  it('should handle invalid routes gracefully', () => {
    cy.visit('/invalid-route')
    cy.contains('Page not found').should('be.visible')
    cy.contains('Go back home').should('be.visible')
    
    // Should be able to navigate back home
    cy.contains('Go back home').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should maintain UI v2 styling across all pages', () => {
    const pages = ['/', '/booking', '/terms', '/privacy']
    
    pages.forEach(page => {
      cy.visit(page)
      cy.waitForPageLoad()
      cy.checkUIV2Elements()
    })
  })

  it('should have working browser back/forward navigation', () => {
    cy.visit('/')
    cy.get('[data-testid="book-consultation-button"]').click()
    cy.url().should('include', '/booking')
    
    cy.go('back')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    cy.go('forward')
    cy.url().should('include', '/booking')
  })

  it('should show correct page titles', () => {
    cy.visit('/')
    cy.title().should('contain', 'HerHealth Hub')
    
    cy.visit('/booking')
    cy.title().should('contain', 'Book Consultation')
    
    cy.visit('/terms')
    cy.title().should('contain', 'Terms of Service')
    
    cy.visit('/privacy')
    cy.title().should('contain', 'Privacy Policy')
  })
})