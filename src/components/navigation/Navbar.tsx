import { NavLink } from "react-router-dom";
import { Crown, Package, Receipt, BarChart3, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  const navItems = [
    { to: "/", label: "Dashboard", icon: BarChart3 },
    { to: "/inventory/categories", label: "Categories", icon: Package },
    { to: "/inventory/products", label: "Products", icon: Package },
    { to: "/inventory/stock", label: "Stock", icon: Package },
    { to: "/billing/new", label: "New Invoice", icon: Receipt },
    { to: "/billing/invoices", label: "Invoices", icon: Receipt },
    { to: "/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2 font-bold text-xl">
              <Crown className="h-6 w-6 text-accent" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CROWN
              </span>
            </NavLink>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
