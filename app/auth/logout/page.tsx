"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut({
        callbackUrl: "/auth/login",
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* SamCon Logo */}
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <span className="text-xl font-bold">SamCon</span>
        </div>

        {/* Logout Confirmation Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Sign Out Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to sign out of your account? This will clear
              your session and redirect you to the login page.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loader spinner-border spinner-border-sm"></span>
                    Signing out...
                  </span>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Yes, Sign Out
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
