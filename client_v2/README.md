# HerHealth Hub UI v2

This is the enhanced UI version with shadcn/ui components and Storybook integration.

## Features

- **Enhanced Components**: Button, Card, and Navbar with multiple variants
- **Teal Color Palette**: Healthcare-focused color scheme with teal primary colors  
- **Storybook Integration**: Interactive component documentation and testing
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Complete Pages**: Rebuilt Landing and Book pages using new teal-themed components
- **API Integration**: Full compatibility with existing backend API calls and routes
- **Professional UI**: Stripe-level quality design with improved trust indicators

## Running the Enhanced UI

### Storybook (Component Development)

From the root project directory:
```bash
cd client_v2 && npx storybook dev -p 6006
```

Or from the client_v2 directory:
```bash
# Start Storybook
npx storybook dev -p 6006

# Build Storybook
npx storybook build
```

### Development Server

To run the enhanced UI with API integration:
```bash
cd client_v2 && npm run dev
```

This will start the enhanced UI on port 5173 with full API connectivity to the backend running on port 5000.

## Component Variants

### Button
- **Variants**: default, teal, teal-outline, teal-ghost, destructive, outline, secondary, ghost, link
- **Sizes**: sm, default, lg, xl, icon

### Card
- **Variants**: default, elevated, outlined, filled, teal, teal-dark
- **Sizes**: compact, sm, default, lg, xl

### Navbar
- **Variants**: default, filled, transparent, teal, teal-light
- **Sizes**: sm, default, lg, xl
- **Features**: sticky positioning, responsive links, action buttons

## Color Palette

The teal color palette is designed for healthcare applications:

- **Primary Teal**: `hsl(174, 89%, 24%)` - Deep teal for primary actions
- **Secondary Teal**: `hsl(165, 89%, 30%)` - Slightly lighter teal for secondary actions
- **Teal Accent**: `hsl(43, 96%, 50%)` - Gold accent for highlights
- **Trust Blue**: `hsl(220, 93%, 38%)` - Trust indicators and badges

## Usage Example

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar, NavbarBrand } from '@/components/ui/navbar'

export function Example() {
  return (
    <>
      <Navbar
        variant="teal"
        logo={<NavbarBrand>HerHealth</NavbarBrand>}
        actions={<Button variant="secondary">Book Now</Button>}
      />
      
      <Card variant="teal">
        <CardHeader>
          <CardTitle>Healthcare Consultation</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="teal">Book Appointment</Button>
        </CardContent>
      </Card>
    </>
  )
}
```