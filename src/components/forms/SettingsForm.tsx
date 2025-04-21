
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type FormValues = {
  display_name: string;
  avatar_url: string;
  email?: string;
};

export function SettingsForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [resetting, setResetting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  useEffect(() => {
    async function fetchProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
      setEmail(sessionData.session.user.email);
      const userId = sessionData.session.user.id;
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", userId)
        .single();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch profile data",
          variant: "destructive",
        });
      } else {
        reset({
          display_name: data.display_name || "",
          avatar_url: data.avatar_url || "",
        });
      }
    }
    fetchProfile();
  }, [reset, toast]);

  const onSubmit = async (values: FormValues) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "Error",
        description: "User session not found",
        variant: "destructive",
      });
      return;
    }
    const userId = sessionData.session.user.id;
    try {
      const updates = {
        id: userId,
        display_name: values.display_name,
        avatar_url: values.avatar_url,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
      toast({ title: "Success", description: "Profile updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendReset = async () => {
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast({
        title: "Error sending reset email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Reset",
        description: "Reset email sent!",
      });
    }
    setResetting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
      <div>
        <Label htmlFor="display_name">Display Name</Label>
        <Input id="display_name" {...register("display_name")} />
      </div>
      <div>
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input id="avatar_url" {...register("avatar_url")} />
      </div>
      <div>
        <Label>Email Address</Label>
        <Input value={email} disabled className="cursor-not-allowed" />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" disabled={resetting} onClick={handleSendReset}>
          {resetting ? "Sending..." : "Send Password Reset Email"}
        </Button>
        <Button type="button" variant="destructive" onClick={handleLogout}>
          Log out
        </Button>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
