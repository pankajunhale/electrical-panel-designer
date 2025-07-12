"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Here you would typically clear auth tokens, cookies, etc.
    console.log("Logging out...");

    // Redirect to login page
    router.push("/auth/login");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600/80 to-purple-700/80 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Centered SamCon Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">SamCon</span>
          </div>
          <p className="text-white/80 text-center text-sm">
            We hope you enjoyed using SamCon
          </p>
        </div>

        {/* Logout Confirmation */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Sign out
            </h1>
            <p className="text-sm text-white/70">
              Are you sure you want to sign out?
            </p>
          </div>

          <Card className="w-full bg-white/5 border-white/20">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-xl text-white">
                  Confirm Logout
                </CardTitle>
              </div>
              <CardDescription className="text-white/70">
                You will be signed out of your account. You can sign back in at
                any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <LogOut className="h-4 w-4" />
                <span>
                  This action will clear your session and redirect you to the
                  login page.
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
