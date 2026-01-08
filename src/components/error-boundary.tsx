"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: true,
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-mono text-destructive">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">Return to Dashboard</a>
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            If this problem persists, please contact{" "}
            <a 
              href="mailto:support@peakdentalstudio.com" 
              className="underline hover:text-foreground"
            >
              support@peakdentalstudio.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

