"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface NotificationPreferences {
  emailCaseUpdates: boolean;
  emailInvoices: boolean;
  emailShipping: boolean;
  inAppCaseUpdates: boolean;
  inAppInvoices: boolean;
  inAppShipping: boolean;
  digestFrequency: string;
}

interface NotificationPreferencesFormProps {
  practiceId: string | undefined;
  preferences: NotificationPreferences;
}

export function NotificationPreferencesForm({
  practiceId,
  preferences,
}: NotificationPreferencesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const [formData, setFormData] = useState<NotificationPreferences>(preferences);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!practiceId) {
      toast.error("No practice found");
      return;
    }

    // Get current settings and merge with new preferences
    const { data: practice } = await supabase
      .from("practices")
      .select("settings")
      .eq("id", practiceId)
      .single();

    const currentSettings = (practice?.settings as Record<string, unknown>) || {};
    const newSettings = {
      ...currentSettings,
      ...formData,
    };

    const { error } = await supabase
      .from("practices")
      .update({
        settings: newSettings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", practiceId);

    if (error) {
      toast.error("Failed to update notification preferences");
      console.error(error);
      return;
    }

    toast.success("Notification preferences updated");
    startTransition(() => {
      router.refresh();
    });
  }

  function handleToggle(key: keyof NotificationPreferences) {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which updates you want to receive via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailCaseUpdates">Case Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails when your cases change status
              </p>
            </div>
            <Switch
              id="emailCaseUpdates"
              checked={formData.emailCaseUpdates}
              onCheckedChange={() => handleToggle("emailCaseUpdates")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailInvoices">Invoice Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails for new invoices and payment reminders
              </p>
            </div>
            <Switch
              id="emailInvoices"
              checked={formData.emailInvoices}
              onCheckedChange={() => handleToggle("emailInvoices")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailShipping">Shipping Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails when cases are shipped or delivered
              </p>
            </div>
            <Switch
              id="emailShipping"
              checked={formData.emailShipping}
              onCheckedChange={() => handleToggle("emailShipping")}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>
            Choose which updates appear in your notification center
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inAppCaseUpdates">Case Updates</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications when your cases change status
              </p>
            </div>
            <Switch
              id="inAppCaseUpdates"
              checked={formData.inAppCaseUpdates}
              onCheckedChange={() => handleToggle("inAppCaseUpdates")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inAppInvoices">Invoice Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications for new invoices and reminders
              </p>
            </div>
            <Switch
              id="inAppInvoices"
              checked={formData.inAppInvoices}
              onCheckedChange={() => handleToggle("inAppInvoices")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inAppShipping">Shipping Updates</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications when cases are shipped or delivered
              </p>
            </div>
            <Switch
              id="inAppShipping"
              checked={formData.inAppShipping}
              onCheckedChange={() => handleToggle("inAppShipping")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Digest</CardTitle>
          <CardDescription>
            Choose how often you receive email notification summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="digestFrequency">Digest Frequency</Label>
              <p className="text-sm text-muted-foreground">
                How often should we send you an email summary?
              </p>
            </div>
            <Select
              value={formData.digestFrequency}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, digestFrequency: value }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
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
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </form>
  );
}


