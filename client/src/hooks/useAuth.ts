import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return null;
      
      try {
        return await apiRequest("GET", "/api/auth/me");
      } catch (error) {
        // If unauthorized, clear token
        if (error instanceof Error && error.message.includes("401")) {
          localStorage.removeItem("authToken");
        }
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("authToken");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      window.location.href = "/";
    },
  });

  return {
    user: data?.user,
    doctorProfile: data?.doctorProfile,
    isLoading,
    isAuthenticated: !!data?.user,
    logout: logoutMutation.mutate,
  };
}