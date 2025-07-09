import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Book from './Book';

// Create a mock query client for Storybook
const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock doctor data
const mockDoctor = {
  id: 1,
  specialty: "Women's Health",
  qualifications: "MBBS, MRCOG",
  profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  bio: "Specialist in gynecology and women's reproductive health with 15+ years experience.",
  rating: 4.9,
  reviewCount: 127
};

// Mock slots data
const mockSlots = [
  {
    id: 1,
    doctorId: 1,
    date: "2025-07-10",
    time: "09:00",
    isAvailable: true
  },
  {
    id: 2,
    doctorId: 1,
    date: "2025-07-10",
    time: "10:30",
    isAvailable: true
  },
  {
    id: 3,
    doctorId: 1,
    date: "2025-07-11",
    time: "14:00",
    isAvailable: true
  },
  {
    id: 4,
    doctorId: 1,
    date: "2025-07-11",
    time: "15:30",
    isAvailable: true
  }
];

// Mock API responses
mockQueryClient.setQueryData(["/api/doctors/1"], mockDoctor);
mockQueryClient.setQueryData(["/api/doctors/1/slots"], mockSlots);

const meta: Meta<typeof Book> = {
  title: 'Pages/Book',
  component: Book,
  parameters: {
    layout: 'fullscreen',
    // Mock the router params
    nextRouter: {
      query: { doctorId: '1' },
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={mockQueryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LoadingState: Story = {
  decorators: [
    (Story) => {
      const loadingQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            enabled: false, // Disable queries to show loading state
          },
        },
      });
      
      return (
        <QueryClientProvider client={loadingQueryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export const NoSlotsAvailable: Story = {
  decorators: [
    (Story) => {
      const noSlotsQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      
      noSlotsQueryClient.setQueryData(["/api/doctors/1"], mockDoctor);
      noSlotsQueryClient.setQueryData(["/api/doctors/1/slots"], []); // No slots available
      
      return (
        <QueryClientProvider client={noSlotsQueryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};