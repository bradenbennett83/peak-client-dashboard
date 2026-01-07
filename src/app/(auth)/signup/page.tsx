import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
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
            &ldquo;Join thousands of dental practices who trust Peak for their
            lab work.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/10" />
            <div>
              <p className="text-white font-medium">Peak Dental Team</p>
              <p className="text-white/60 text-sm">Excellence in Dental Lab Services</p>
            </div>
          </div>
        </div>

        <p className="text-white/40 text-sm">
          © 2026 Peak Dental Studio. All rights reserved.
        </p>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-semibold">Peak Dental Studio</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your details to get started
            </p>
          </div>

          <SignupForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

