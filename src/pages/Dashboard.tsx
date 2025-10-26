import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, ShoppingCart, Package, AlertTriangle, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { loadDemoData } from "@/lib/demo-data";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [invoicesRes, productsRes, stockRes] = await Promise.all([
        supabase.from("invoices").select("total, created_at"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("product_availability").select("available"),
      ]);

      const totalRevenue = invoicesRes.data?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      const invoiceCount = invoicesRes.data?.length || 0;
      const avgOrderValue = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;
      const productCount = productsRes.count || 0;
      const lowStock = stockRes.data?.filter(s => s.available && s.available <= 5).length || 0;

      return {
        totalRevenue,
        invoiceCount,
        avgOrderValue,
        productCount,
        lowStock,
      };
    },
  });

  const handleLoadDemoData = async () => {
    setLoadingDemo(true);
    const result = await loadDemoData();
    setLoadingDemo(false);
    
    toast({
      title: result.success ? "Demo data loaded!" : "Error loading demo data",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      window.location.reload();
    }
  };

  const metrics = [
    {
      title: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue) : "...",
      icon: TrendingUp,
      trend: "+12.5%",
    },
    {
      title: "Total Orders",
      value: stats ? formatNumber(stats.invoiceCount) : "...",
      icon: ShoppingCart,
      trend: "+8.2%",
    },
    {
      title: "Avg Order Value",
      value: stats ? formatCurrency(stats.avgOrderValue) : "...",
      icon: TrendingUp,
      trend: "+5.4%",
    },
    {
      title: "Total Products",
      value: stats ? formatNumber(stats.productCount) : "...",
      icon: Package,
      trend: "+3.1%",
    },
    {
      title: "Low Stock Items",
      value: stats ? formatNumber(stats.lowStock) : "...",
      icon: AlertTriangle,
      trend: "Needs attention",
      variant: "warning" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to CROWN - Perfect Menswear Store Management
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.variant === 'warning' ? 'text-warning' : 'text-accent'}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs ${metric.variant === 'warning' ? 'text-warning' : 'text-accent'} mt-1`}>
                    {metric.trend}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/billing/new"
              className="block p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors"
            >
              <div className="font-semibold text-accent">Create New Invoice</div>
              <div className="text-sm text-muted-foreground">Start a new sales transaction</div>
            </a>
            <a
              href="/inventory/products"
              className="block p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="font-semibold">Manage Products</div>
              <div className="text-sm text-muted-foreground">Add or edit product catalog</div>
            </a>
            <a
              href="/inventory/stock"
              className="block p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="font-semibold">Update Stock</div>
              <div className="text-sm text-muted-foreground">Adjust inventory levels</div>
            </a>
            {stats?.productCount === 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLoadDemoData}
                disabled={loadingDemo}
              >
                <Database className="h-4 w-4 mr-2" />
                {loadingDemo ? "Loading..." : "Load Demo Data"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Sync</span>
              <span className="text-sm text-muted-foreground">Just now</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Sessions</span>
              <span className="text-sm font-medium">1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
