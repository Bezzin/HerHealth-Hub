describe('Booking Flow - UI v2', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  it('should complete full booking flow from landing page', () => {
    // Start from landing page
    cy.get('[data-testid="book-consultation-button"]').click()
    
    // Should redirect to booking page
    cy.url().should('include', '/booking')
    cy.waitForPageLoad()
    
    // Wait for doctors to load
    cy.waitForAPI('/api/doctors')
    
    // Select first doctor
    cy.selectFirstDoctor()
    
    // Should show slot selection
    cy.contains('Available Times').should('be.visible')
    
    // Select first available slot
    cy.get('[data-testid="slot-button"]').first().click()
    
    // Fill booking form
    cy.fillBookingForm()
    
    // Should show booking summary before payment
    cy.contains('Booking Summary').should('be.visible')
    cy.contains('£55').should('be.visible')
    cy.contains('20 minutes').should('be.visible')
    
    // Check proceed to payment button exists
    cy.get('[data-testid="proceed-payment-button"]').should('be.visible')
  })

  it('should validate booking form fields', () => {
    cy.visit('/booking')
    cy.waitForPageLoad()
    
    // Wait for doctors and select one
    cy.waitForAPI('/api/doctors')
    cy.selectFirstDoctor()
    
    // Select a slot
    cy.get('[data-testid="slot-button"]').first().click()
    
    // Try to submit empty form
    cy.get('[data-testid="proceed-payment-button"]').click()
    
    // Should show validation errors
    cy.contains('Name is required').should('be.visible')
    cy.contains('Email is required').should('be.visible')
  })

  it('should show correct pricing and consultation details', () => {
    cy.visit('/booking')
    cy.waitForPageLoad()
    cy.waitForAPI('/api/doctors')
    cy.selectFirstDoctor()
    
    // Check consultation details
    cy.contains('£55').should('be.visible')
    cy.contains('20 minutes').should('be.visible')
    cy.contains('Video consultation').should('be.visible')
  })

  it('should handle slot availability correctly', () => {
    cy.visit('/booking')
    cy.waitForPageLoad()
    cy.waitForAPI('/api/doctors')
    cy.selectFirstDoctor()
    
    // Should show available slots
    cy.get('[data-testid="slot-button"]').should('have.length.greaterThan', 0)
    
    // Slots should be clickable
    cy.get('[data-testid="slot-button"]').first().should('not.be.disabled')
  })

  it('should display emergency disclaimer', () => {
    cy.visit('/booking')
    cy.waitForPageLoad()
    
    // Check for emergency disclaimer
    cy.contains('not for medical emergencies').should('be.visible')
    cy.contains('999').should('be.visible')
  })

  it('should work on mobile devices', () => {
    cy.viewport('iphone-x')
    cy.visit('/booking')
    cy.waitForPageLoad()
    cy.waitForAPI('/api/doctors')
    
    // Mobile booking flow should work
    cy.selectFirstDoctor()
    cy.get('[data-testid="slot-button"]').first().click()
    cy.fillBookingForm()
    cy.get('[data-testid="proceed-payment-button"]').should('be.visible')
  })
})