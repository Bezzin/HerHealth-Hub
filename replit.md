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

## User Preferences

Preferred communication style: Simple, everyday language.