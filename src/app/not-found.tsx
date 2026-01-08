import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Custom 404 Page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/cases">
                <ArrowLeft className="mr-2 h-4 w-4" />
                View Cases
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Need help? Contact{" "}
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

