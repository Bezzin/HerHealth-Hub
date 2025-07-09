import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Landing from './Landing';

// Create a mock query client for Storybook
const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock doctors data
const mockDoctors = [
  {
    id: 1,
    specialty: "Women's Health",
    qualifications: "MBBS, MRCOG",
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    bio: "Specialist in gynecology and women's reproductive health with 15+ years experience.",
    rating: 4.9,
    reviewCount: 127,
    averageRating: 4.9,
    totalFeedbacks: 127
  },
  {
    id: 2,
    specialty: "Fertility",
    qualifications: "MBBS, PhD",
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    bio: "Leading fertility specialist helping couples achieve their family dreams.",
    rating: 4.8,
    reviewCount: 89,
    averageRating: 4.8,
    totalFeedbacks: 89
  },
  {
    id: 3,
    specialty: "Menopause",
    qualifications: "MBBS, FRCOG",
    profileImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    bio: "Expert in menopause management and hormone replacement therapy.",
    rating: 4.7,
    reviewCount: 156,
    averageRating: 4.7,
    totalFeedbacks: 156
  }
];

// Mock API responses
mockQueryClient.setQueryData(["/api/doctors"], mockDoctors);
mockQueryClient.setQueryData(["/api/doctors", "with-ratings"], mockDoctors);

const meta: Meta<typeof Landing> = {
  title: 'Pages/Landing',
  component: Landing,
  parameters: {
    layout: 'fullscreen',
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