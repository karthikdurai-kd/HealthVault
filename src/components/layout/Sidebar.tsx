
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Activity,
  FileText,
  Home,
  PieChart,
  Stethoscope,
  Calendar,
  Settings
} from "lucide-react";

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
    </div>
  );
};

export default Sidebar;
