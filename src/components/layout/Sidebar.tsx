import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Activity,
  FileText,
  Home,
  PieChart,
  Stethoscope,
  Calendar,
  Settings,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Health Metrics", href: "/metrics", icon: Activity },
  { name: "Doctors & Visits", href: "/doctors", icon: Stethoscope },
  { name: "Prescriptions", href: "/prescriptions", icon: FileText },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="hidden border-r bg-sidebar md:flex md:w-60 md:flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="h-6 w-6 rounded-full bg-health-blue-700"></span>
          <span className="text-lg font-bold text-health-blue-700">HealthScope</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-foreground",
                  currentPath === item.href 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button className="w-full justify-start gap-2" variant="outline">
          <PlusCircle className="h-4 w-4" />
          Add Health Data
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
