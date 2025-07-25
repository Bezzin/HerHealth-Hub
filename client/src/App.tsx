import { Switch, Route } from "wouter";
import { lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/error-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import Checkout from "@/pages/checkout";
import Invite from "@/pages/invite";
import Admin from "@/pages/admin";
import DoctorDashboard from "@/pages/doctor-dashboard";
import MyBookings from "@/pages/my-bookings";
import Profile from "@/pages/profile";
import Questionnaire from "@/pages/questionnaire";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";
import IntakeWizard from "@/components/IntakeWizard";
import LoadingTailor from "@/pages/loading";
import Recommendation from "@/pages/recommendation";
import Login from "@/pages/login";
import Signup from "@/pages/signup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/booking/:doctorId" component={Booking} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/invite/:token" component={Invite} />
      <Route path="/admin" component={Admin} />
      <Route path="/dashboard/doctor" component={DoctorDashboard} />
      <Route path="/my-bookings" component={MyBookings} />
      <Route path="/profile" component={Profile} />
      <Route path="/questionnaire/:slotId" component={Questionnaire} />
      <Route path="/intake" component={IntakeWizard} />
      <Route path="/loading" component={LoadingTailor} />
      <Route path="/recommendation" component={Recommendation} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/feedback/:bookingId" component={lazy(() => import("./pages/feedback"))} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
