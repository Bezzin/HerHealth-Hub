import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Heart, Download, ArrowRight } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'teal', 'teal-outline', 'teal-ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'xl', 'icon'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Teal: Story = {
  args: {
    variant: 'teal',
    children: 'Teal Button',
  },
};

export const TealOutline: Story = {
  args: {
    variant: 'teal-outline',
    children: 'Teal Outline',
  },
};

export const TealGhost: Story = {
  args: {
    variant: 'teal-ghost',
    children: 'Teal Ghost',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'teal',
    children: (
      <>
        <Heart className="mr-2 h-4 w-4" />
        Like
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'teal-outline',
    size: 'icon',
    children: <Download className="h-4 w-4" />,
  },
};

export const Large: Story = {
  args: {
    variant: 'teal',
    size: 'lg',
    children: 'Large Button',
  },
};

export const ExtraLarge: Story = {
  args: {
    variant: 'teal',
    size: 'xl',
    children: (
      <>
        Get Started
        <ArrowRight className="ml-2 h-5 w-5" />
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    variant: 'teal',
    disabled: true,
    children: 'Disabled Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="teal">Teal</Button>
      <Button variant="teal-outline">Teal Outline</Button>
      <Button variant="teal-ghost">Teal Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button variant="teal" size="sm">Small</Button>
      <Button variant="teal" size="default">Default</Button>
      <Button variant="teal" size="lg">Large</Button>
      <Button variant="teal" size="xl">Extra Large</Button>
    </div>
  ),
};