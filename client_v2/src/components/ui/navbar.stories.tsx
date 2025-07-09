import type { Meta, StoryObj } from '@storybook/react';
import { Navbar, NavbarBrand } from './navbar';
import { Button } from './button';
import { Heart, User, Menu } from 'lucide-react';

const meta: Meta<typeof Navbar> = {
  title: 'UI/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'transparent', 'teal', 'teal-light'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'xl'],
    },
    sticky: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logo: (
      <NavbarBrand>
        <Heart className="h-6 w-6 text-teal-600" />
        HerHealth
      </NavbarBrand>
    ),
    links: [
      { label: 'Home', href: '#', active: true },
      { label: 'Doctors', href: '#' },
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    actions: (
      <>
        <Button variant="ghost">Sign In</Button>
        <Button variant="teal">Book Now</Button>
      </>
    ),
  },
};

export const Teal: Story = {
  args: {
    variant: 'teal',
    logo: (
      <NavbarBrand className="text-white">
        <Heart className="h-6 w-6 text-white" />
        HerHealth
      </NavbarBrand>
    ),
    links: [
      { label: 'Home', href: '#', active: true },
      { label: 'Doctors', href: '#' },
      { label: 'Services', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    actions: (
      <>
        <Button variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
          Sign In
        </Button>
        <Button variant="secondary">
          Book Consultation
        </Button>
      </>
    ),
  },
};

export const TealLight: Story = {
  args: {
    variant: 'teal-light',
    logo: (
      <NavbarBrand className="text-teal-800">
        <Heart className="h-6 w-6 text-teal-600" />
        HerHealth Hub
      </NavbarBrand>
    ),
    links: [
      { label: 'Home', href: '#', active: true },
      { label: 'Find Doctors', href: '#' },
      { label: 'How It Works', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Support', href: '#' },
    ],
    actions: (
      <>
        <Button variant="teal-ghost">Sign In</Button>
        <Button variant="teal">Get Started</Button>
      </>
    ),
  },
};

export const Minimal: Story = {
  args: {
    variant: 'transparent',
    logo: (
      <NavbarBrand>
        <Heart className="h-6 w-6 text-teal-600" />
        HerHealth
      </NavbarBrand>
    ),
    actions: (
      <Button variant="teal-outline">
        <User className="mr-2 h-4 w-4" />
        Account
      </Button>
    ),
  },
};

export const Mobile: Story = {
  args: {
    variant: 'teal-light',
    size: 'sm',
    logo: (
      <NavbarBrand className="text-teal-800">
        <Heart className="h-5 w-5 text-teal-600" />
        HerHealth
      </NavbarBrand>
    ),
    actions: (
      <Button variant="ghost" size="icon">
        <Menu className="h-5 w-5" />
      </Button>
    ),
  },
};

export const Large: Story = {
  args: {
    variant: 'default',
    size: 'lg',
    logo: (
      <NavbarBrand className="text-xl">
        <Heart className="h-8 w-8 text-teal-600" />
        HerHealth Hub
      </NavbarBrand>
    ),
    links: [
      { label: 'Home', href: '#', active: true },
      { label: 'Find Specialists', href: '#' },
      { label: 'How It Works', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Resources', href: '#' },
      { label: 'Support', href: '#' },
    ],
    actions: (
      <>
        <Button variant="teal-ghost" size="lg">Sign In</Button>
        <Button variant="teal" size="lg">Book Consultation</Button>
      </>
    ),
  },
};

export const Sticky: Story = {
  args: {
    variant: 'teal',
    sticky: true,
    logo: (
      <NavbarBrand className="text-white">
        <Heart className="h-6 w-6 text-white" />
        HerHealth
      </NavbarBrand>
    ),
    links: [
      { label: 'Home', href: '#', active: true },
      { label: 'Doctors', href: '#' },
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    actions: (
      <>
        <Button variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
          Sign In
        </Button>
        <Button variant="secondary">
          Book Now
        </Button>
      </>
    ),
  },
  render: (args) => (
    <div className="h-screen">
      <Navbar {...args} />
      <div className="p-8 space-y-4">
        <p>Scroll down to see the sticky navbar in action.</p>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i} className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-1">
      <Navbar
        variant="default"
        logo={<NavbarBrand>Default</NavbarBrand>}
        actions={<Button size="sm">Action</Button>}
      />
      <Navbar
        variant="filled"
        logo={<NavbarBrand className="text-white">Filled</NavbarBrand>}
        actions={<Button variant="outline" size="sm" className="border-white text-white">Action</Button>}
      />
      <Navbar
        variant="teal"
        logo={<NavbarBrand className="text-white">Teal</NavbarBrand>}
        actions={<Button variant="secondary" size="sm">Action</Button>}
      />
      <Navbar
        variant="teal-light"
        logo={<NavbarBrand className="text-teal-800">Teal Light</NavbarBrand>}
        actions={<Button variant="teal" size="sm">Action</Button>}
      />
      <Navbar
        variant="transparent"
        logo={<NavbarBrand>Transparent</NavbarBrand>}
        actions={<Button variant="teal-outline" size="sm">Action</Button>}
      />
    </div>
  ),
};