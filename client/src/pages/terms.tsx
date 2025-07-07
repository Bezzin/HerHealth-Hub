import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: July 7, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Our Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                HerHealth Hub provides booking, payment, and communication tools. All medical advice is delivered by the consulting clinician, who carries their own professional indemnity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                HerHealth Hub is a healthcare booking platform that connects patients with qualified healthcare professionals for video consultations. We facilitate appointments but do not provide medical services directly.
              </p>
              <p className="text-gray-700">
                All medical consultations are conducted by independent healthcare professionals who are responsible for their own clinical decisions and maintain their own professional indemnity insurance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">As a user of our platform, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate and truthful information during registration and consultations</li>
                  <li>Attend scheduled appointments on time or cancel with appropriate notice</li>
                  <li>Pay consultation fees as agreed</li>
                  <li>Respect healthcare professionals and other users</li>
                  <li>Use the platform only for legitimate healthcare purposes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Payment and Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Consultation fees are £55 per 30-minute session. Payment is required at the time of booking through our secure payment system powered by Stripe.
                </p>
                <p className="text-gray-700">
                  Cancellations made more than 24 hours before the scheduled appointment are eligible for a full refund. Cancellations made within 24 hours may be subject to fees.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Medical Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">
                  The healthcare professionals using our platform are independent practitioners responsible for their own clinical decisions. HerHealth Hub does not provide medical advice or treatment.
                </p>
                <p className="text-gray-700">
                  In case of medical emergencies, contact emergency services (999 in the UK) immediately. Our platform is not suitable for urgent or emergency medical situations.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We are committed to protecting your privacy and complying with UK data protection laws. Please see our Privacy Policy for detailed information about how we collect, use, and protect your personal data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Platform Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                While we strive to maintain continuous service availability, we cannot guarantee uninterrupted access to our platform. We reserve the right to perform maintenance and updates that may temporarily affect service availability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                HerHealth Hub's liability is limited to facilitating connections between patients and healthcare professionals. We are not liable for the quality, accuracy, or outcomes of medical consultations provided by independent practitioners.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                For questions about these Terms of Service, please contact us at support@herhealth.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}