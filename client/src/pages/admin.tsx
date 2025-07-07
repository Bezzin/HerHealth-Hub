import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Mail, Plus, UserPlus, ExternalLink } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface GeneratedInvite {
  email: string;
  inviteUrl: string;
  token: string;
  timestamp: Date;
}

export default function Admin() {
  const [generatedInvites, setGeneratedInvites] = useState<GeneratedInvite[]>([]);
  const { toast } = useToast();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      const response = await apiRequest("POST", "/api/doctor/invite", data);
      const result = await response.json();

      const newInvite: GeneratedInvite = {
        email: data.email,
        inviteUrl: result.inviteUrl,
        token: result.token,
        timestamp: new Date(),
      };

      setGeneratedInvites(prev => [newInvite, ...prev]);

      toast({
        title: "Invite Created",
        description: `Invite sent to ${data.email}`,
      });

      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create invite",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Invite URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const openInviteLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <UserPlus className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Doctor Invitations</h1>
          <p className="text-gray-600 mt-2">Invite qualified doctors to join HerHealth Hub</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Invite Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Send Invite
                </CardTitle>
                <CardDescription>
                  Generate an invitation link for a new doctor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor's Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="doctor@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Plus className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Invite
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Generated Invites */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Invitations</CardTitle>
                <CardDescription>
                  {generatedInvites.length === 0 
                    ? "No invitations created yet" 
                    : `${generatedInvites.length} invitation${generatedInvites.length > 1 ? 's' : ''} generated`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedInvites.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Create your first doctor invitation using the form on the left</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedInvites.map((invite, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{invite.email}</h4>
                            <p className="text-sm text-gray-500">
                              Created {invite.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        
                        <div className="bg-gray-50 rounded p-3 text-sm font-mono text-gray-700 break-all">
                          {invite.inviteUrl}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(invite.inviteUrl)}
                            className="flex-1"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInviteLink(invite.inviteUrl)}
                            className="flex-1"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">1</div>
                <h4 className="font-medium mb-1">Create Invite</h4>
                <p className="text-gray-600">Enter the doctor's email address to generate a unique invitation link</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">2</div>
                <h4 className="font-medium mb-1">Send Link</h4>
                <p className="text-gray-600">Share the invitation link with the doctor via email or direct message</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">3</div>
                <h4 className="font-medium mb-1">Doctor Onboards</h4>
                <p className="text-gray-600">Doctor completes profile, connects Stripe, and sets availability slots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Platform */}
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            ← Back to Platform
          </Button>
        </div>
      </div>
    </div>
  );
}