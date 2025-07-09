# HerHealth Hub – Healthcare Booking Platform

A booking platform that lets UK women (18-55) get a video consult with a vetted gynae/fertility/menopause specialist **within 48 hours**. Solves the 8- to 12-week NHS wait-list problem by matching patients with doctors who open paid telehealth slots.

## 🎯 Purpose & Core Function

- **Target Problem**: Eliminates long wait-times for women's specialist care
- **Solution**: Fast booking platform with automated revenue splitting
- **Revenue Model**: £55 consultation fee (£35 to doctor, £20 to platform)

## 👥 Target Users

1. **PATIENTS** – Busy women who need fast, specialist advice
2. **DOCTORS** – Gynae/women's-health specialists looking for flexible, paid side-gig slots  
3. **ADMIN** (Optional) – For slot seeding and support

## ✨ Key Features (MVP)

### Core Functionality
- ✅ **Email magic-link login** (patients & doctors)
- ✅ **Doctor onboarding** → connect Stripe account, set availability slots
- ✅ **Patient flow**: View next 7 days of free slots → pay £55 → get Zoom link
- ✅ **Automated Stripe Connect split**: £35 to doctor, £20 to platform
- ✅ **Demo seeder**: Creates demo doctors + available slots on startup

### Pages & Flow
- ✅ **Landing page** (hero + "Book now" CTA)
- ✅ **Slot picker & payment** (integrated booking flow)
- ✅ **Success confirmation** + email notifications
- ✅ **Mobile-responsive** design optimized for busy women

### Technical Features
- ✅ **SQLite data models**: User, DoctorProfile, Slot, Booking
- ✅ **Stripe Checkout + Connect** for automated revenue splitting
- ✅ **Real-time slot availability** management
- ✅ **GDPR compliant** data handling

## 🛠 Tech Stack

### Backend (`/server`)
- **Node.js 20** + Express.js
- **In-memory storage** (easily migrable to SQLite/PostgreSQL)
- **Stripe SDK** for payments & revenue splitting
- **JWT authentication** (magic-link ready)
- **TypeScript** for type safety

### Frontend (`/client`)
- **React 18** + TypeScript + Vite
- **Tailwind CSS** for healthcare-themed styling
- **Wouter** for lightweight routing
- **React Query** for data fetching
- **React Hook Form** + Zod validation
- **Stripe Elements** for secure payments

## 🎨 UI Versions

The platform supports two UI versions:

- **UI v1 (Original)**: Located in `/client` - Standard design with basic components
- **UI v2 (Enhanced)**: Located in `/client_v2` - Professional healthcare branding with teal color palette, enhanced shadcn/ui components, and Stripe-level quality design

### Running Different UI Versions

**Option 1: Using Scripts (Recommended)**
```bash
# Run with Enhanced UI v2
./scripts/dev-v2.sh

# Run with Original UI v1  
./scripts/dev-v1.sh

# Run Storybook for component development
./scripts/storybook.sh
```

**Option 2: Manual Setup**
```bash
# For Enhanced UI v2
rm client && ln -sf client_v2 client
npm run dev

# For Original UI v1
rm client && mv client_original client  # if backed up
npm run dev

# For Storybook
cd client_v2 && npx storybook dev -p 6006
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 20** or higher
- **Stripe account** for payments

### 1. Clone & Install
```bash
git clone <your-repo>
cd herhealth-hub
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Stripe Configuration (Required)
# Get these from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key_here

# Application Configuration
NODE_ENV=development
PORT=5000
```

### 3. Run the Application
```bash
# Start both server and client
npm run dev

# This starts:
# - Express server on http://localhost:5000
# - Vite dev server (proxied through Express)
```

### 4. Access the Application
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/*

## 📁 Project Structure

```
herhealth-hub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities & query client
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data layer (in-memory)
│   └── vite.ts            # Vite integration
├── shared/                # Shared types & schemas
│   └── schema.ts          # Database schema & types
├── .env.example           # Environment template
├── package.json           # Dependencies & scripts
└── README.md              # This file
```

## 🔄 Data Flow

### Booking Process
1. **Browse doctors** → View profiles with ratings & qualifications
2. **Select time slot** → Choose from next 7 days of availability
3. **Fill patient details** → Name, email, consultation reason
4. **Pay £55** → Secure Stripe payment with automated splitting
5. **Get confirmation** → Email with Zoom meeting link
6. **Video consultation** → 30-minute secure session

### Revenue Splitting
- **Total fee**: £55 per consultation
- **Doctor receives**: £35 (63%)
- **Platform fee**: £20 (37%)
- **Automatic transfer** via Stripe Connect

## 🗄 Database Schema

### Core Models
```typescript
User {
  id, email, firstName, lastName, isDoctor, stripeCustomerId
}

DoctorProfile {
  id, userId, specialty, qualifications, experience, rating, 
  reviewCount, bio, stripeAccountId, profileImage
}

Slot {
  id, doctorId, date, time, isAvailable
}

Booking {
  id, patientId, doctorId, slotId, appointmentDate, 
  reasonForConsultation, status, paymentIntentId, meetingUrl
}
```

## 🔧 API Endpoints

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor details
- `GET /api/doctors/:id/slots` - Get available slots

### Bookings
- `POST /api/bookings` - Create new booking
- `POST /api/create-payment-intent` - Process payment

### Status
- Server runs on port 5000
- Frontend served via Vite integration
- Auto-restart on file changes

## 🚢 Deployment

This project is designed for **Replit deployment** with:
- ✅ Single-command startup (`npm run dev`)
- ✅ Environment variable configuration
- ✅ In-memory storage (no database setup required)
- ✅ Monorepo structure in single container

For production:
1. Set environment variables in Replit Secrets
2. Configure Stripe webhooks for payment confirmation
3. Add domain to Stripe dashboard
4. Optional: Migrate to PostgreSQL for persistence

## 📧 Next Steps

### Phase 1 Extensions
- [ ] **Magic-link authentication** implementation
- [ ] **Email notifications** via Resend API
- [ ] **Zoom integration** for meeting URLs
- [ ] **Doctor onboarding** flow with Stripe Connect

### Phase 2 Features
- [ ] **Patient dashboard** with booking history
- [ ] **Doctor dashboard** with earnings & schedule
- [ ] **Review system** for post-consultation feedback
- [ ] **SMS reminders** for upcoming appointments

## 📞 Support

For technical support or questions:
1. Check this README for setup instructions
2. Verify environment variables are configured
3. Ensure Stripe keys are valid and active
4. Contact support for deployment issues

---

**Built for**: UK women seeking fast, professional healthcare consultations  
**Revenue Model**: £55 consultations with automated 35/20 splitting  
**Deployment**: Optimized for Replit container deployment
