import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F1214] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-white text-xl font-semibold">
              Peak Dental Studio
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <blockquote className="text-2xl font-light text-white/90 leading-relaxed">
            &ldquo;Streamline your dental lab workflow with our client portal.
            Submit cases, track progress, and manage invoices all in one
            place.&rdquo;
          </blockquote>
          <p className="text-white/60">
            Trusted by dental practices across the country
          </p>
        </div>

        <div className="text-white/40 text-sm">
          © {new Date().getFullYear()} Peak Dental Studio. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-semibold">Peak Dental Studio</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Contact us for access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

