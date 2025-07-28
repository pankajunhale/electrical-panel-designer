import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <a href="/" className="flex items-center gap-3 font-medium">
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
          </a>
          <p className="text-white/80 text-center text-sm">
            Welcome to your electrical panel design workspace
          </p>
        </div>

        {/* Login Form - now simplified since form handles its own card */}
        <LoginForm />

        {/* Terms & Privacy */}
        <div className="text-center text-xs text-white/60 mt-6">
          By signing in, you agree to our{" "}
          <a
            href="/terms"
            className="underline underline-offset-4 hover:text-white transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="underline underline-offset-4 hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
