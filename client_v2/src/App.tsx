import { Switch, Route } from "wouter";
import { queryClient } from "../../client/src/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Landing from "./pages/Landing";
import Book from "./pages/Book";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/booking/:doctorId" component={Book} />
      <Route component={() => <div>Page not found</div>} />
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