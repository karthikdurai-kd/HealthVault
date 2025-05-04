
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // For demo: You might want to show user's real display name and avatar
  const [profile, setProfile] = React.useState<{ display_name?: string; avatar_url?: string } | null>(null);

  React.useEffect(() => {
    let ignore = false;
    async function fetchProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const userId = sessionData.session.user.id;
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name,avatar_url")
          .eq("id", userId)
          .single();
        if (!ignore && data) setProfile({ display_name: data.display_name, avatar_url: data.avatar_url });
      }
    }
    fetchProfile();
    return () => { ignore = true; }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span className="cursor-pointer">
          <Avatar>
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={profile?.display_name || "User"}
            />
            <AvatarFallback className="bg-health-blue-100 text-health-blue-700">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <div className="px-3 py-2">
          <div className="font-semibold">{profile?.display_name || "User"}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { setOpen(false); navigate("/settings"); }}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
