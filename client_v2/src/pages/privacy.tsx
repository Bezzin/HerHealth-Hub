import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: July 7, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Personal Information:</strong> Name, email address, phone number (optional)</li>
                  <li><strong>Booking Information:</strong> Appointment dates, times, consultation reasons</li>
                  <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store card details)</li>
                  <li><strong>Symptom Questionnaire:</strong> Basic symptom information provided before consultations</li>
                  <li><strong>Medical History Documents:</strong> Files you choose to upload (PDFs, images)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. What We Don't Store</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                <strong>Important:</strong> We do not store full clinical records; we only store booking metadata and the brief symptom questionnaire you provide for the clinician. All medical consultation content and clinical notes remain with the consulting healthcare professional.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Facilitate appointment bookings between you and healthcare professionals</li>
                  <li>Process payments for consultations</li>
                  <li>Send appointment confirmations and reminders</li>
                  <li>Provide customer support</li>
                  <li>Share your symptom questionnaire with your chosen clinician</li>
                  <li>Improve our platform and services</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">We share your information only in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>With Healthcare Professionals:</strong> Your booking details and symptom questionnaire are shared with your chosen clinician</li>
                  <li><strong>Payment Processing:</strong> Payment information is processed by Stripe in compliance with PCI DSS standards</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                  <li><strong>Service Providers:</strong> With trusted third parties who help us operate our platform (under strict confidentiality agreements)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">We implement appropriate security measures to protect your personal information:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure payment processing through Stripe</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Secure file storage for uploaded medical documents</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">Under UK data protection law, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Access your personal data</li>
                  <li>Rectify inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  To exercise these rights, please contact us at privacy@herhealth.com
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We retain your personal information only as long as necessary to provide our services and comply with legal obligations. Booking and payment records are typically retained for 7 years for accounting and legal purposes. You can request earlier deletion of your account and associated data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies and Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We use essential cookies to ensure our platform functions properly. We do not use tracking cookies or third-party analytics without your explicit consent. You can control cookie settings through your browser.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last updated" date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-700">
                  For questions about this Privacy Policy or our data practices, contact us at:
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@herhealth.com<br />
                  <strong>Data Protection Officer:</strong> dpo@herhealth.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}