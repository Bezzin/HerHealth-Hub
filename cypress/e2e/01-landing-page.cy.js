describe('Landing Page - UI v2', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  it('should display the hero section with correct branding', () => {
    // Check hero title contains the 48-hour promise
    cy.contains('Get expert women\'s health advice within 48 hours', { timeout: 10000 }).should('be.visible')
    
    // Check for main CTA button
    cy.get('[data-testid="book-consultation-button"]').should('be.visible')
    cy.get('[data-testid="book-consultation-button"]').should('contain', 'Book Consultation')
  })

  it('should display trust indicators', () => {
    // Check for security badges
    cy.contains('GDPR Compliant').should('be.visible')
    cy.contains('Secure Payments').should('be.visible')
    cy.contains('Qualified Doctors').should('be.visible')
  })

  it('should show doctor profiles with ratings', () => {
    // Wait for doctors to load
    cy.waitForAPI('/api/doctors')
    
    // Check doctor cards are visible
    cy.get('[data-testid="doctor-card"]').should('have.length.greaterThan', 0)
    
    // Check doctor information is displayed
    cy.get('[data-testid="doctor-card"]').first().within(() => {
      cy.get('[data-testid="doctor-name"]').should('be.visible')
      cy.get('[data-testid="doctor-specialty"]').should('be.visible')
      cy.get('[data-testid="doctor-experience"]').should('be.visible')
      cy.get('[data-testid="book-now-button"]').should('be.visible')
    })
  })

  it('should display how it works section', () => {
    cy.contains('How It Works').should('be.visible')
    cy.contains('Choose your specialist').should('be.visible')
    cy.contains('Book your slot').should('be.visible')
    cy.contains('Video consultation').should('be.visible')
  })

  it('should have working footer links', () => {
    cy.get('footer').within(() => {
      cy.contains('Terms of Service').should('be.visible')
      cy.contains('Privacy Policy').should('be.visible')
    })
    
    // Test footer links navigation
    cy.contains('Terms of Service').click()
    cy.url().should('include', '/terms')
    cy.go('back')
    
    cy.contains('Privacy Policy').click()
    cy.url().should('include', '/privacy')
    cy.go('back')
  })

  it('should display UI v2 teal color scheme', () => {
    cy.checkUIV2Elements()
  })

  it('should be mobile responsive', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    cy.get('[data-testid="book-consultation-button"]').should('be.visible')
    cy.get('[data-testid="doctor-card"]').should('be.visible')
    
    // Test tablet viewport
    cy.viewport('ipad-2')
    cy.get('[data-testid="book-consultation-button"]').should('be.visible')
    cy.get('[data-testid="doctor-card"]').should('be.visible')
  })
})