describe('Payment Flow - UI v2', () => {
  beforeEach(() => {
    cy.visit('/booking')
    cy.waitForPageLoad()
    cy.waitForAPI('/api/doctors')
  })

  it('should show checkout page with booking summary', () => {
    // Complete booking form
    cy.selectFirstDoctor()
    cy.get('[data-testid="slot-button"]').first().click()
    cy.fillBookingForm()
    
    // Proceed to payment
    cy.get('[data-testid="proceed-payment-button"]').click()
    
    // Should redirect to checkout
    cy.url().should('include', '/checkout')
    cy.waitForPageLoad()
    
    // Should show booking summary
    cy.contains('Booking Summary').should('be.visible')
    cy.contains('£55').should('be.visible')
    cy.contains('Consultation Fee').should('be.visible')
  })

  it('should display payment form elements', () => {
    // Navigate to checkout with minimal data
    cy.selectFirstDoctor()
    cy.get('[data-testid="slot-button"]').first().click()
    cy.fillBookingForm()
    cy.get('[data-testid="proceed-payment-button"]').click()
    
    cy.url().should('include', '/checkout')
    
    // Wait for Stripe elements to load
    cy.get('.StripeElement', { timeout: 15000 }).should('exist')
    
    // Should show secure payment indicators
    cy.contains('Secure Payment').should('be.visible')
    cy.contains('SSL Encrypted').should('be.visible')
  })

  it('should show correct consultation details in summary', () => {
    cy.selectFirstDoctor()
    cy.get('[data-testid="slot-button"]').first().click()
    cy.fillBookingForm()
    cy.get('[data-testid="proceed-payment-button"]').click()
    
    cy.url().should('include', '/checkout')
    
    // Check booking details
    cy.contains('Test Patient').should('be.visible')
    cy.contains('test@example.com').should('be.visible')
    cy.contains('20 minutes').should('be.visible')
    cy.contains('£55').should('be.visible')
  })

  it('should handle payment form validation', () => {
    cy.selectFirstDoctor()
    cy.get('[data-testid="slot-button"]').first().click()
    cy.fillBookingForm()
    cy.get('[data-testid="proceed-payment-button"]').click()
    
    cy.url().should('include', '/checkout')
    
    // Try to submit without payment details
    cy.get('button[type="submit"]').should('be.visible')
    
    // Should show loading state when appropriate
    cy.get('[data-testid="payment-loading"]').should('not.exist')
  })

  it('should display refund policy information', () => {
    cy.selectFirstDoctor()
    cy.get('[data-testid="slot-button"]').first().click()
    cy.fillBookingForm()
    cy.get('[data-testid="proceed-payment-button"]').click()
    
    cy.url().should('include', '/checkout')
    
    // Check refund policy
    cy.contains('24 hours').should('be.visible')
    cy.contains('refund').should('be.visible')
  })

  it('should show emergency disclaimer on payment page', () => {
    cy.selectFirstDoctor()
    cy.get('[data-testid="slot-button"]').first().click()
    cy.fillBookingForm()
    cy.get('[data-testid="proceed-payment-button"]').click()
    
    cy.url().should('include', '/checkout')
    
    // Emergency disclaimer should be visible
    cy.contains('not for medical emergencies').should('be.visible')
    cy.contains('999').should('be.visible')
  })

  it('should work on mobile devices', () => {
    cy.viewport('iphone-x')
    
    cy.selectFirstDoctor()
    cy.get('[data-testid="slot-button"]').first().click()
    cy.fillBookingForm()
    cy.get('[data-testid="proceed-payment-button"]').click()
    
    cy.url().should('include', '/checkout')
    
    // Payment form should be mobile responsive
    cy.get('.StripeElement', { timeout: 15000 }).should('be.visible')
    cy.contains('£55').should('be.visible')
  })
})