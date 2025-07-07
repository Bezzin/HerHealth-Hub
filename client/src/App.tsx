import { Switch, Route } from "wouter";
import { lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import Checkout from "@/pages/checkout";
import Invite from "@/pages/invite";
import Admin from "@/pages/admin";
import DoctorDashboard from "@/pages/doctor-dashboard";
import MyBookings from "@/pages/my-bookings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/booking/:doctorId" component={Booking} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/invite/:token" component={Invite} />
      <Route path="/admin" component={Admin} />
      <Route path="/dashboard/doctor" component={DoctorDashboard} />
      <Route path="/my-bookings" component={MyBookings} />
      <Route path="/feedback/:bookingId" component={lazy(() => import("./pages/feedback"))} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
