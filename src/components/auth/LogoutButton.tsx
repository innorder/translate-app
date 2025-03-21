"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

export default function LogoutButton({
  variant = "ghost",
  size = "sm",
  showIcon = true,
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Use the supabase client directly

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      disabled={loading}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
