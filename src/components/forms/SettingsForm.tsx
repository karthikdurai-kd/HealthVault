
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
};

export function SettingsForm() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  useEffect(() => {
    async function fetchProfile() {
      const user = supabase.auth.getUser(); // getUser() returns a promise
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
