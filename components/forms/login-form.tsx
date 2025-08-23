"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/schema/auth";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useTransition } from "react";

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const callbackUrl = "/cp";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    startTransition(async () => {
      try {
        setError("");
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid credentials");
        } else {
          router.push(callbackUrl);
        }
      } catch {
        setError("An error occurred. Please try again.");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="loader spinner-border spinner-border-sm"></span>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm">
          <a
            href="/register"
            className="underline underline-offset-4 hover:text-primary text-muted-foreground"
          >
            Don&apos;t have an account? Sign up
          </a>
        </div>
      </form>
    </Form>
  );
}
