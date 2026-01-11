import Link from "next/link";
import { Users, Building2, CreditCard, Bell, Shield } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUserWithProfile } from "@/lib/auth/get-user";

export default async function SettingsPage() {
  const { profile } = await requireUserWithProfile();

  const settingsItems = [
    {
      title: "Practice Profile",
      description: "Update your practice name, address, and contact information",
      href: "/settings/practice",
      icon: Building2,
    },
    ...(profile?.role === "admin"
      ? [
          {
            title: "Team Members",
            description: "Manage users and invite new team members",
            href: "/settings/users",
            icon: Users,
          },
        ]
      : []),
    {
      title: "Payment Methods",
      description: "Manage your saved payment methods for invoices",
      href: "/settings/payment-methods",
      icon: CreditCard,
    },
    {
      title: "Notifications",
      description: "Configure email and in-app notification preferences",
      href: "/settings/notifications",
      icon: Bell,
    },
    {
      title: "Security",
      description: "Update your password and security settings",
      href: "/settings/security",
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light tracking-tight font-serif">Settings</h1>
        <p className="text-muted-foreground">
          Manage your practice settings and preferences
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {settingsItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

