"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Truck, CheckCircle2, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewShippingLabelPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    trackingNumber: string;
    labelUrl?: string;
    labelData?: string;
  } | null>(null);
  const [weight, setWeight] = useState("1");

  async function handleCreateLabel() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/shipping/create-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create shipping label");
      }

      setResult({
        trackingNumber: data.shippingLabel.trackingNumber,
        labelUrl: data.shippingLabel.labelUrl,
        labelData: data.shippingLabel.labelData,
      });

      toast.success("Shipping label created successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create shipping label";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/shipping">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shipping
          </Link>
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center py-12">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-semibold mb-2">Label Created!</h1>
            <p className="text-muted-foreground text-center mb-6">
              Your prepaid shipping label is ready. Print it and attach it to
              your package.
            </p>

            <div className="w-full max-w-sm space-y-4 mb-8">
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Tracking Number
                </p>
                <p className="font-mono text-lg font-medium">
                  {result.trackingNumber}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              {result.labelUrl && (
                <Button className="flex-1" asChild>
                  <a href={result.labelUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Label
                  </a>
                </Button>
              )}
              <Button variant="outline" className="flex-1" asChild>
                <a
                  href={`https://www.ups.com/track?tracknum=${result.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Track Package
                </a>
              </Button>
            </div>

            <Button
              variant="ghost"
              className="mt-6"
              onClick={() => router.push("/shipping")}
            >
              Return to Shipping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/shipping">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shipping
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-light tracking-tight font-serif">
          Create Shipping Label
        </h1>
        <p className="text-muted-foreground">
          Generate a prepaid UPS 2-Day shipping label
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>
                Enter the weight of your package. The shipping address will be
                pulled from your practice profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Package Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0.1"
                  max="150"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="1"
                />
                <p className="text-sm text-muted-foreground">
                  Estimate the weight of your package including any padding or
                  case boxes.
                </p>
              </div>

              <Button
                onClick={handleCreateLabel}
                disabled={isLoading || !weight}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Label...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" />
                    Create Shipping Label
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ship To</CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic text-sm">
                <strong>Peak Dental Studio</strong>
                <br />
                123 Peak Way
                <br />
                Denver, CO 80202
                <br />
                United States
              </address>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-muted-foreground">
                    Peak covers all inbound shipping costs. Your label includes
                    UPS 2-Day Air service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

