import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, CreditCard, Users } from "lucide-react";

export default function TrustIndicators() {
  const indicators = [
    {
      icon: Shield,
      title: "GMC Verified",
      description: "All doctors verified with General Medical Council"
    },
    {
      icon: Lock,
      title: "Secure & Confidential",
      description: "End-to-end encrypted video consultations"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Protected by Stripe's bank-level security"
    },
    {
      icon: Users,
      title: "4,000+ Consultations",
      description: "Trusted by thousands of women across the UK"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      {indicators.map((indicator, index) => {
        const Icon = indicator.icon;
        return (
          <Card key={index} className="border-gray-200 hover:border-teal-300 transition-colors">
            <CardContent className="p-4 text-center">
              <Icon className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm text-gray-900">{indicator.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{indicator.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}