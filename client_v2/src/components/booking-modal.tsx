import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Calendar, Star, Shield, Check, CreditCard, Lock } from "lucide-react";
import type { DoctorProfile } from "@shared/schema";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfile | null;
}

const timeSlots = [
  { date: "Today", time: "2:00 PM" },
  { date: "Today", time: "4:30 PM" },
  { date: "Tomorrow", time: "9:00 AM" },
  { date: "Tomorrow", time: "11:30 AM" },
];

export default function BookingModal({ isOpen, onClose, doctor }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    reason: "",
    acceptTerms: false,
  });

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Book Consultation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <img 
              src={doctor.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
              alt="Doctor" 
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-900">Dr. {doctor.specialty}</h4>
              <p className="text-sm text-gray-600">{doctor.specialty} • {doctor.qualifications}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Star className="text-accent" size={16} />
                <span className="text-sm text-gray-600">{doctor.rating} ({doctor.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Consultation Fee */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-gray-900">Consultation Fee</h5>
                <p className="text-sm text-gray-600">30-minute video consultation</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">£55</p>
                <p className="text-sm text-gray-600">Secure payment</p>
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Available Times (Next 7 Days)</h5>
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`p-3 text-left justify-start h-auto ${
                    selectedSlot === `${slot.date}-${slot.time}`
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setSelectedSlot(`${slot.date}-${slot.time}`)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{slot.date}</div>
                    <div className="text-sm text-gray-600">{slot.time}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Patient Details Form */}
          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Your Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email address"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="reason">Reason for Consultation</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={3}
                placeholder="Briefly describe your health concern..."
              />
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="text-trust" size={20} />
              <h6 className="font-semibold text-gray-900">Your Privacy & Security</h6>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="text-secondary" size={16} />
                <span>End-to-end encrypted video consultations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="text-secondary" size={16} />
                <span>GDPR compliant data handling</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="text-secondary" size={16} />
                <span>Secure payment processing via Stripe</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => setFormData({...formData, acceptTerms: !!checked})}
            />
            <div className="text-sm text-gray-600">
              <Label htmlFor="acceptTerms" className="cursor-pointer">
                I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. I understand that this consultation is for informational purposes and does not replace emergency medical care.
              </Label>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            onClick={() => {
              // Handle payment processing
              console.log('Process payment', formData, selectedSlot);
            }}
          >
            <div className="flex items-center justify-center space-x-2">
              <CreditCard size={20} />
              <span>Pay £55 & Book Consultation</span>
            </div>
          </Button>
          
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="text-2xl text-gray-400">💳</div>
            <div className="text-2xl text-gray-400">💳</div>
            <div className="text-2xl text-gray-400">💳</div>
            <div className="flex items-center space-x-1">
              <Lock className="text-gray-400" size={16} />
              <span className="text-xs text-gray-500">Secure Payment</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
