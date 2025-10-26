import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import MainLayout from "@/components/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/inventory/Categories";
import Products from "@/pages/inventory/Products";
import Stock from "@/pages/inventory/Stock";
import InvoiceBuilder from "@/pages/billing/InvoiceBuilder";
import Invoices from "@/pages/billing/Invoices";
import InvoiceDetail from "@/pages/billing/InvoiceDetail";
import Reports from "@/pages/reports/Reports";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="crown-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory/categories" element={<Categories />} />
              <Route path="/inventory/products" element={<Products />} />
              <Route path="/inventory/stock" element={<Stock />} />
              <Route path="/billing/new" element={<InvoiceBuilder />} />
              <Route path="/billing/invoices" element={<Invoices />} />
              <Route path="/billing/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
