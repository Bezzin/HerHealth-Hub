describe('UI v2 Components', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  it('should display enhanced button components', () => {
    // Check for teal button variants
    cy.get('[data-testid="book-consultation-button"]').should('have.class', 'teal')
    
    // Test button interactions
    cy.get('[data-testid="book-consultation-button"]').trigger('mouseover')
    cy.get('[data-testid="book-consultation-button"]').should('be.visible')
  })

  it('should display enhanced card components', () => {
    cy.waitForAPI('/api/doctors')
    
    // Check doctor cards use enhanced styling
    cy.get('[data-testid="doctor-card"]').should('have.class', 'card')
    cy.get('[data-testid="doctor-card"]').first().should('have.class', 'teal')
  })

  it('should display enhanced navbar component', () => {
    // Check navbar styling
    cy.get('nav').should('exist')
    cy.get('nav').should('have.class', 'teal')
    
    // Check logo/brand
    cy.contains('HerHealth Hub').should('be.visible')
  })

  it('should have consistent color scheme', () => {
    // Check for teal color usage throughout the page
    cy.get('[class*="teal"]').should('have.length.greaterThan', 0)
    
    // Check for consistent healthcare theming
    cy.get('body').should('have.css', 'font-family')
  })

  it('should have proper accessibility features', () => {
    // Check for alt text on images
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt')
    })
    
    // Check for proper heading hierarchy
    cy.get('h1').should('exist')
    
    // Check for proper button labeling
    cy.get('button').each(($btn) => {
      const hasText = $btn.text().trim().length > 0
      const hasAriaLabel = $btn.attr('aria-label')
      expect(hasText || hasAriaLabel).to.be.true
    })
  })

  it('should have responsive design elements', () => {
    // Test different viewport sizes
    const viewports = [
      [1280, 720],   // Desktop
      [768, 1024],   // Tablet
      [375, 667]     // Mobile
    ]
    
    viewports.forEach(([width, height]) => {
      cy.viewport(width, height)
      cy.get('[data-testid="book-consultation-button"]').should('be.visible')
      cy.get('[data-testid="doctor-card"]').should('be.visible')
    })
  })

  it('should have proper form elements styling', () => {
    cy.visit('/booking')
    cy.waitForPageLoad()
    cy.waitForAPI('/api/doctors')
    cy.selectFirstDoctor()
    cy.get('[data-testid="slot-button"]').first().click()
    
    // Check form input styling
    cy.get('input[name="name"]').should('have.class', 'input')
    cy.get('input[name="email"]').should('have.class', 'input')
    cy.get('textarea[name="reasonForConsultation"]').should('have.class', 'textarea')
  })
})