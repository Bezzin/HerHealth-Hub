
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PhoneNumberManagerProps {
  userId: number;
}

export default function PhoneNumberManager({ userId }: PhoneNumberManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's current phone number
  const { data: userPhone, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'phone'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${userId}/phone`);
      return response.json();
    },
  });

  // Update phone number mutation
  const updatePhoneMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest("PUT", `/api/users/${userId}/phone`, {
        phoneNumber: phone
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Phone Number Updated",
        description: "Your phone number has been saved successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'phone'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setPhoneNumber(userPhone?.phoneNumber || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    updatePhoneMutation.mutate(phoneNumber);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPhoneNumber("");
  };

  const formatPhoneNumber = (phone: string) => {
    // Basic formatting for UK numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('44')) {
      return `+${cleaned}`;
    }
    return phone;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number (Optional)
        </label>
        
        {!isEditing ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">
                {userPhone?.phoneNumber 
                  ? formatPhoneNumber(userPhone.phoneNumber)
                  : "No phone number added"
                }
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {userPhone?.phoneNumber ? "Edit" : "Add"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="+44 7123 456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSave}
                disabled={updatePhoneMutation.isPending}
                size="sm"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updatePhoneMutation.isPending}
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Alert>
        <Phone className="w-4 h-4" />
        <AlertDescription>
          Adding your phone number allows us to send you SMS reminders 24 hours before your appointments.
          You can opt out at any time by replying STOP to any text message.
        </AlertDescription>
      </Alert>

      {userPhone?.phoneNumber && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium text-blue-900 mb-1">✓ SMS Reminders Enabled</p>
          <p>You'll receive appointment reminders via text message at this number.</p>
        </div>
      )}
    </div>
  );
}
