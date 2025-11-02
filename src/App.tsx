import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeDatabase } from "@/lib/database";
import { useAppStore } from "@/store/useAppStore";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminScanner from "./pages/admin/AdminScanner";
import AdminParticipants from "./pages/admin/AdminParticipants";
import ParticipantLogin from "./pages/participant/ParticipantLogin";
import ParticipantDashboard from "./pages/participant/ParticipantDashboard";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize database connection on app start
    initializeDatabase().then((success) => {
      if (success) {
        console.log('Database initialized successfully');
      } else {
        console.warn('Database initialization failed - app will work in offline mode');
      }
    });

    // Add store to window for debugging
    if (typeof window !== 'undefined') {
      (window as typeof window & { __zustandStore: typeof useAppStore }).__zustandStore = useAppStore;
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/scanner" element={<AdminScanner />} />
            <Route path="/admin/participants" element={<AdminParticipants />} />
            <Route path="/participant/login" element={<ParticipantLogin />} />
            <Route path="/participant/dashboard" element={<ParticipantDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
