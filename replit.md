# HerHealth Hub - Healthcare Booking Platform

## Overview

HerHealth Hub is a healthcare booking platform that lets UK women (18-55) get a video consult with a vetted gynae/fertility/menopause specialist **within 48 hours**. The platform solves the 8- to 12-week NHS wait-list problem by matching patients with doctors who open paid telehealth slots, featuring automated Stripe Connect revenue splitting (£35 to doctor, £20 to platform).

## Target Users & Problem Solved

1. **PATIENTS** – Busy women who need fast, specialist advice
2. **DOCTORS** – Gynae/women's-health specialists looking for flexible, paid side-gig slots
3. **ADMIN** (Optional) – For slot seeding and support

**Problem Solved**: Eliminates long wait-times for women's specialist care while providing doctors flexible income opportunities.

## System Architecture

### Frontend Architecture (`/client`)
- **React 18** with TypeScript for type safety and modern development
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling with custom healthcare-themed color scheme
- **Wouter** for lightweight client-side routing
- **React Query** for efficient data fetching and caching
- **React Hook Form** with Zod validation for robust form handling
- **Stripe Elements** for secure payment processing

### Backend Architecture (`/server`)
- **Node.js 20** with Express.js for the REST API server
- **TypeScript** throughout for type safety and better developer experience
- **In-memory storage** with abstracted storage interface for easy SQLite/PostgreSQL migration
- **Stripe SDK** for payment processing with automated revenue splitting via Stripe Connect
- **JWT-based authentication** (prepared for magic-link implementation)

### Component Structure
- Modular component architecture with reusable UI components
- Shared schema definitions between frontend and backend (`/shared`)
- Centralized query client for consistent API communication
- Toast notifications for user feedback

## Key Components (MVP Implementation)

### Slot-Based Booking System
- **Real-time slot management**: 7-day availability window with automatic seeding
- **Time slot tracking**: Doctors have 4 slots per day (09:00, 10:30, 14:00, 15:30)
- **Instant availability**: Slots marked unavailable upon booking
- **Patient booking flow**: Select slot → fill details → pay £55 → get confirmation

### Authentication System (Ready for Magic-Link)
- JWT token-based session management prepared
- Role-based access (patients and doctors)
- Current: Basic user creation, ready for magic-link email authentication

### Doctor Management & Profiles
- Doctor profile creation with qualifications and experience
- Rating and review system (4.9★ average with review counts)
- Specialty tracking (General Practice, Women's Health, Mental Health)
- Professional images and bio descriptions

### Payment Integration (Stripe Connect)
- **Revenue splitting**: Automated £35 to doctor, £20 to platform
- **Stripe Elements**: Secure payment forms with real-time validation
- **Payment intent management**: Linked to bookings with metadata
- **Transfer groups**: Ready for Stripe Connect account payouts

### User Interface & Experience
- **Mobile-first design**: Optimized for busy women on-the-go
- **Healthcare branding**: Trusted color scheme (teal primary, gold accents)
- **Trust indicators**: GDPR compliance, secure payments, qualified doctors
- **Intuitive flow**: Landing → Doctor selection → Slot picker → Payment → Confirmation

## Data Flow

### Booking Flow
1. User browses available doctors with profiles and ratings
2. User selects preferred doctor and available time slot
3. User fills booking form with personal details and consultation reason
4. System creates booking record and initiates Stripe payment
5. Payment processing with automated revenue splitting
6. Booking confirmation and meeting URL generation
7. Email notifications to both patient and doctor

### Data Storage
- **Users**: Email, name, role, Stripe customer ID
- **Doctor Profiles**: Qualifications, experience, specialties, ratings, availability
- **Bookings**: Patient/doctor linkage, appointment details, payment status, meeting URLs

## External Dependencies

### Payment Processing
- **Stripe API**: Payment processing, customer management, revenue splitting
- **Stripe Elements**: Secure payment form components
- **Stripe Connect**: Multi-party payment handling

### Development Tools
- **Drizzle ORM**: Database abstraction layer (configured for PostgreSQL)
- **Zod**: Runtime type validation
- **React Query**: Server state management
- **Tailwind CSS**: Utility-first styling

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Consistent icon library
- **React Hook Form**: Form state management

## Deployment Strategy

### Environment Configuration
- Environment-specific configuration via `.env` files
- Stripe API keys for payment processing
- Database connection strings
- JWT secrets for authentication

### Build Process
- Vite for frontend bundling with TypeScript compilation
- esbuild for backend bundling
- Optimized production builds with code splitting

### Database Migration
- Drizzle ORM configured for PostgreSQL migration
- In-memory storage for development with easy database swap
- Schema definitions shared between application layers

## Data Flow

### Booking Process
1. **Browse doctors** → View profiles with ratings & qualifications
2. **Select time slot** → Choose from next 7 days of availability
3. **Fill patient details** → Name, email, consultation reason
4. **Pay £55** → Secure Stripe payment with automated splitting
5. **Get confirmation** → Email with Zoom meeting link
6. **Video consultation** → 30-minute secure session

### Doctor Onboarding Process
1. **Admin creates invite** → Generate unique token via `/admin` page
2. **Doctor receives link** → One-time invitation URL with 7-day expiry
3. **Complete profile** → Personal info, qualifications, experience
4. **Set availability** → Select initial time slots from next 7 days
5. **Account creation** → User account + doctor profile + slots created
6. **Revenue ready** → Ready for Stripe Connect integration

### Revenue Splitting
- **Total fee**: £55 per consultation
- **Doctor receives**: £35 (63%)
- **Platform fee**: £20 (37%)
- **Automatic transfer** via Stripe Connect

## Data Storage
- **Users**: Email, name, role, Stripe customer ID
- **Doctor Profiles**: Qualifications, experience, specialties, ratings, availability
- **Slots**: Doctor linkage, date/time, availability status
- **Bookings**: Patient/doctor linkage, appointment details, payment status, meeting URLs
- **Doctor Invites**: Email, token, expiry, usage status

## External Dependencies

### Payment Processing
- **Stripe API**: Payment processing, customer management, revenue splitting
- **Stripe Elements**: Secure payment form components
- **Stripe Connect**: Multi-party payment handling

### Development Tools
- **Drizzle ORM**: Database abstraction layer (configured for PostgreSQL)
- **Zod**: Runtime type validation
- **React Query**: Server state management
- **Tailwind CSS**: Utility-first styling

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Consistent icon library
- **React Hook Form**: Form state management

## Deployment Strategy

### Environment Configuration
- Environment-specific configuration via `.env` files
- Stripe API keys for payment processing
- Database connection strings
- JWT secrets for authentication

### Build Process
- Vite for frontend bundling with TypeScript compilation
- esbuild for backend bundling
- Optimized production builds with code splitting

### Database Migration
- Drizzle ORM configured for PostgreSQL migration
- In-memory storage for development with easy database swap
- Schema definitions shared between application layers

## Changelog

- July 07, 2025. Initial setup
- July 07, 2025. Added doctor self-onboarding system with invite tokens, profile creation, and slot management
- July 07, 2025. Fixed Stripe payment intent creation by removing application_fee_amount (requires Stripe Connect setup)
- July 07, 2025. Implemented Stripe Connect integration with automated revenue splitting (£35 to doctor, £20 to platform)
- July 07, 2025. Added development mode simulation for Stripe Connect testing without platform approval
- July 07, 2025. Integrated comprehensive notification system with email (Resend) and SMS (Twilio) for booking confirmations and 24h reminders
- July 07, 2025. Added phone number field to booking schema and cron scheduler for automated reminder delivery
- July 07, 2025. Implemented complete reschedule/cancel flow with 24-hour advance notice requirement and automatic slot availability updates
- July 07, 2025. Added My Bookings page with UI for patient booking management and confirmation email integration
- July 07, 2025. Implemented complete post-consultation feedback system with email links to /feedback/:bookingId route
- July 07, 2025. Added feedback database schema with rating storage and average rating calculation for doctors
- July 07, 2025. Created feedback submission API with duplicate prevention and booking validation
- July 07, 2025. Updated doctor cards to display real-time average ratings fetched from feedback data
- July 07, 2025. Added professional feedback request emails triggered after consultation completion
- July 07, 2025. Updated My Bookings page with color-coded status indicators (blue=pending, green=completed, red=cancelled, yellow=rescheduled)
- July 07, 2025. Added "Join Zoom" button that appears 15 minutes before appointment start time and remains active during consultation window
- July 07, 2025. Enhanced booking dashboard with visual status badges and improved appointment management interface
- July 07, 2025. Implemented WebSocket real-time notifications for doctor dashboard using native ws package
- July 07, 2025. Added instant toast notifications when new bookings arrive with patient name and appointment details
- July 07, 2025. Created WebSocket server on /ws path with doctor registration system for targeted notifications
- July 07, 2025. Implemented patient medical history upload system with drag-and-drop functionality
- July 07, 2025. Added file validation (PDF/JPG/PNG, 5MB limit) and secure server-side storage in uploads/ directory
- July 07, 2025. Created /profile page with medical document management and view/replace functionality
- July 07, 2025. Extended User schema with medicalHistoryUrl field and added database operations for file storage
- July 07, 2025. Implemented AI-powered symptom questionnaire with 8 dynamic questions accessible at /questionnaire/:slotId
- July 07, 2025. Integrated OpenAI API for generating 3-bullet clinical summaries from patient symptom data
- July 07, 2025. Added symptom data storage in booking records with JSON questionnaire answers and AI-generated summaries
- July 07, 2025. Created symptom summary component for doctors to review patient information before consultations
- July 07, 2025. Added indemnity confirmation checkbox to doctor onboarding with required "MDU/MPS/MDDUS indemnity covers private video consultations" 
- July 07, 2025. Extended DoctorProfile schema with indemnityConfirmed boolean field and validation requirements
- July 07, 2025. Enhanced admin panel to display green shield icon for doctors with confirmed indemnity coverage
- July 07, 2025. Form validation prevents doctor onboarding without indemnity confirmation checkbox checked
- July 07, 2025. Created comprehensive Terms of Service page with "Our Role" section clarifying platform liability
- July 07, 2025. Built Privacy Policy page with data storage limitations and clinical records disclaimer  
- July 07, 2025. Updated footer to link Terms (/terms) and Privacy Policy (/privacy) pages
- July 07, 2025. Enhanced Terms of Service with company registration details, age requirements (18+), and prescription disclaimers
- July 07, 2025. Updated consultation duration to 20 minutes and clarified cancellation policy (≥24h = refund, <24h = no refund)
- July 07, 2025. Added governing law clause (England & Wales jurisdiction) and professional indemnity confirmation section
- July 07, 2025. Enhanced booking confirmation email template with emergency service disclaimer and clinician responsibility notice
- July 07, 2025. Updated email consultation duration from 30 to 20 minutes to match platform terms
- July 09, 2025. Converted design brief to /docs/design_principles.md with core principles TL;DR
- July 09, 2025. Conducted comprehensive UX audit following Stripe-level design standards
- July 09, 2025. Identified 34 friction points across patient and doctor flows with priority rankings
- July 09, 2025. Created /docs/friction_board.md with 10 trust-breaking and 15 friction issues requiring immediate fixes
- July 09, 2025. Fixed 7 critical UX issues: removed admin link from homepage, corrected consultation duration to 20 minutes, added booking summary to checkout, improved phone field helper text, added 48-hour promise to hero, fixed terms/privacy links, added booking details API endpoint
- July 09, 2025. Fixed 8 additional UX friction points: enhanced mobile responsiveness, added required field indicators, improved loading states, better error messaging, button accessibility, form validation feedback, and functional hero CTAs
- July 12, 2025. Implemented complete 4-minute intake assessment system with 21 comprehensive health questions organized into 4 logical steps
- July 12, 2025. Built intelligent recommendation engine that analyzes patient responses to match with appropriate specialists (Fertility, Menopause, Endometriosis, Women's Health GP)
- July 12, 2025. Created loading screen with progress animation and seamless flow from assessment to specialist recommendations
- July 12, 2025. Updated doctor database with 4 specialist types and enhanced doctor profiles to match recommendation categories
- July 12, 2025. Added "Start 4-min Assessment" button to hero section connecting intake flow to booking system
- July 19, 2025. Expanded specialist categories from 4 to 8 types (General Practice, Women's Health, Gynaecology, Fertility & Reproductive Health, Menopause & Hormone Health, Mental Health, Dermatology, Endocrinologist)
- July 19, 2025. Implemented AI analysis of intake assessments using GPT-4o to generate clinical summaries with 3-4 bullet points for doctors
- July 19, 2025. Updated recommendation engine to intelligently match patients to the 8 specialist categories based on symptoms, diagnoses, and medications
- July 19, 2025. Added bulk operations to doctor slot selection: "Select All", "Clear All", "Copy First Day to All", and per-day "All/None" buttons
- July 19, 2025. Created endpoints for doctors to access intake assessment data and AI-generated summaries linked to bookings
- July 19, 2025. Implemented LinkedIn import functionality for doctor onboarding with professional profile data extraction
- July 19, 2025. Added mock LinkedIn OAuth flow for development with simulated professional credentials and experience
- July 19, 2025. Integrated LinkedIn import button into doctor invite flow with automatic form field population
- July 19, 2025. Enhanced trust and credibility with verification badges, trust indicators, and patient testimonials
- July 19, 2025. Created comprehensive intake assessment summary component for doctors to review patient health data
- July 19, 2025. Added verification badges to doctor profiles showing GMC registration and experience levels
- July 19, 2025. Implemented patient testimonials section with real stories to build trust and social proof

## User Preferences

Preferred communication style: Simple, everyday language.