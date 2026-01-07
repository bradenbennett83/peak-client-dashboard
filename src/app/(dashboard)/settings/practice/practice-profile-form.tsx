"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Practice } from "@/types";

interface PracticeProfileFormProps {
  practice: Practice | null;
}

export function PracticeProfileForm({ practice }: PracticeProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: practice?.name || "",
    email: practice?.email || "",
    phone: practice?.phone || "",
    billing_address: practice?.billing_address || "",
    shipping_address: practice?.shipping_address || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!practice?.id) {
      toast.error("No practice found");
      return;
    }

    const { error } = await supabase
      .from("practices")
      .update({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        billing_address: formData.billing_address,
        shipping_address: formData.shipping_address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", practice.id);

    if (error) {
      toast.error("Failed to update practice profile");
      console.error(error);
      return;
    }

    toast.success("Practice profile updated successfully");
    startTransition(() => {
      router.refresh();
    });
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Your practice name and primary contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Practice Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter practice name"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="office@dentalpractice.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
          <CardDescription>
            Billing and shipping addresses for your practice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billing_address">Billing Address</Label>
            <Textarea
              id="billing_address"
              name="billing_address"
              value={formData.billing_address}
              onChange={handleChange}
              placeholder="Enter billing address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping_address">Shipping Address</Label>
            <Textarea
              id="shipping_address"
              name="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              placeholder="Enter shipping address (where you want cases delivered)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This is the default address where completed cases will be shipped
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}


