describe('Doctor Profiles - UI v2', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
    cy.waitForAPI('/api/doctors')
  })

  it('should display all doctor information correctly', () => {
    cy.get('[data-testid="doctor-card"]').first().within(() => {
      // Check all required doctor information
      cy.get('[data-testid="doctor-name"]').should('not.be.empty')
      cy.get('[data-testid="doctor-specialty"]').should('not.be.empty')
      cy.get('[data-testid="doctor-experience"]').should('contain', 'years')
      cy.get('[data-testid="doctor-qualifications"]').should('not.be.empty')
      cy.get('[data-testid="book-now-button"]').should('be.visible')
    })
  })

  it('should show doctor ratings and reviews', () => {
    // Wait for rating data to load
    cy.get('[data-testid="doctor-card"]').first().within(() => {
      // Rating should be displayed (even if 0)
      cy.get('[data-testid="doctor-rating"]').should('exist')
      cy.get('[data-testid="total-feedbacks"]').should('exist')
    })
  })

  it('should display doctor specialties correctly', () => {
    const expectedSpecialties = [
      'General Practice',
      'Women\'s Health', 
      'Mental Health'
    ]
    
    cy.get('[data-testid="doctor-specialty"]').each(($specialty) => {
      const specialtyText = $specialty.text()
      expect(expectedSpecialties.some(expected => 
        specialtyText.includes(expected)
      )).to.be.true
    })
  })

  it('should show proper doctor qualifications', () => {
    cy.get('[data-testid="doctor-qualifications"]').each(($quals) => {
      // Should contain medical qualifications
      const qualsText = $quals.text()
      expect(qualsText).to.match(/(MBBS|MBChB|MRCGP|DRCOG|BSc|MSc)/)
    })
  })

  it('should handle book now button clicks', () => {
    cy.get('[data-testid="book-now-button"]').first().click()
    
    // Should navigate to booking page
    cy.url().should('include', '/booking')
  })

  it('should display UI v2 enhanced styling', () => {
    cy.get('[data-testid="doctor-card"]').first().within(() => {
      // Check for enhanced card styling
      cy.root().should('have.class', 'card')
      cy.checkUIV2Elements()
    })
  })

  it('should be responsive on different screen sizes', () => {
    // Desktop view
    cy.viewport(1280, 720)
    cy.get('[data-testid="doctor-card"]').should('be.visible')
    
    // Tablet view
    cy.viewport('ipad-2')
    cy.get('[data-testid="doctor-card"]').should('be.visible')
    
    // Mobile view
    cy.viewport('iphone-x')
    cy.get('[data-testid="doctor-card"]').should('be.visible')
  })
})