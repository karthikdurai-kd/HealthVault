
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserMenu from "@/components/layout/UserMenu";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <span className="hidden font-bold text-xl text-health-blue-700 sm:inline-block">
          Medicare AI
        </span>
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
