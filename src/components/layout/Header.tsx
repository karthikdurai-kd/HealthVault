
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserMenu from "@/components/layout/UserMenu";
import { Link } from "react-router-dom";
const Header = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
       <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="h-6 w-6 rounded-full bg-health-blue-700"></span>
          <span className="text-lg font-bold text-health-blue-700">HealthVault</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {/* Removed Bell/Notification button */}
        <Button variant="ghost" size="icon" asChild>
          <a href="/settings" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </a>
        </Button>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
