import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Heart, MessageCircle, Share } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'outlined', 'filled', 'teal', 'teal-dark'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'xl', 'compact'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>
            This is a description of the card content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter>
          <Button>Action</Button>
        </CardFooter>
      </>
    ),
  },
};

export const Teal: Story = {
  args: {
    variant: 'teal',
    children: (
      <>
        <CardHeader>
          <CardTitle>Teal Card</CardTitle>
          <CardDescription>
            A beautiful teal-themed card perfect for healthcare applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card uses the teal color palette to create a calming, trustworthy appearance.</p>
        </CardContent>
        <CardFooter>
          <Button variant="teal">Learn More</Button>
        </CardFooter>
      </>
    ),
  },
};

export const TealDark: Story = {
  args: {
    variant: 'teal-dark',
    children: (
      <>
        <CardHeader>
          <CardTitle className="text-white">Dark Teal Card</CardTitle>
          <CardDescription className="text-teal-100">
            A dark teal card with white text for high contrast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-teal-50">Perfect for call-to-action sections or highlighting important information.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
            Get Started
          </Button>
        </CardFooter>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>
            This card has enhanced shadow for more prominence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Great for important announcements or featured content.</p>
        </CardContent>
      </>
    ),
  },
};

export const Compact: Story = {
  args: {
    variant: 'default',
    size: 'compact',
    children: (
      <>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Compact Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Less padding for dense layouts.</p>
        </CardContent>
      </>
    ),
  },
};

export const ProductCard: Story = {
  render: () => (
    <Card variant="teal" className="w-80">
      <CardHeader>
        <div className="aspect-video bg-teal-100 rounded-lg mb-4 flex items-center justify-center">
          <Heart className="h-12 w-12 text-teal-600" />
        </div>
        <CardTitle>Healthcare Consultation</CardTitle>
        <CardDescription>
          Connect with qualified specialists for personalized care.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Duration</span>
            <span className="font-medium">30 minutes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Price</span>
            <span className="font-medium text-teal-600">£55</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="teal">Book Now</Button>
      </CardFooter>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent>Standard card styling</CardContent>
      </Card>
      
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
        </CardHeader>
        <CardContent>Enhanced shadow</CardContent>
      </Card>
      
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Outlined</CardTitle>
        </CardHeader>
        <CardContent>Thicker border</CardContent>
      </Card>
      
      <Card variant="filled">
        <CardHeader>
          <CardTitle>Filled</CardTitle>
        </CardHeader>
        <CardContent>Muted background</CardContent>
      </Card>
      
      <Card variant="teal">
        <CardHeader>
          <CardTitle>Teal</CardTitle>
        </CardHeader>
        <CardContent>Teal color theme</CardContent>
      </Card>
      
      <Card variant="teal-dark">
        <CardHeader>
          <CardTitle className="text-white">Teal Dark</CardTitle>
        </CardHeader>
        <CardContent className="text-teal-50">Dark teal background</CardContent>
      </Card>
    </div>
  ),
};