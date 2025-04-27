
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
        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
