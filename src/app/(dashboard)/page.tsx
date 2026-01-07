import { Suspense } from "react";
import Link from "next/link";
import {
  FileText,
  Receipt,
  Truck,
  Plus,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your practice.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/cases/new">
              <Plus className="mr-2 h-4 w-4" />
              Submit New Case
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatCardSkeleton />}>
          <StatCard
            title="Cases in Progress"
            value="12"
            description="+2 from last week"
            icon={FileText}
            trend="up"
          />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <StatCard
            title="Pending Invoices"
            value="$2,450"
            description="3 invoices pending"
            icon={Receipt}
            trend="neutral"
          />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <StatCard
            title="Recent Shipments"
            value="8"
            description="Last 30 days"
            icon={Truck}
            trend="up"
          />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <StatCard
            title="Avg. Turnaround"
            value="5 days"
            description="Standard cases"
            icon={FileText}
            trend="down"
          />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Cases */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Recent Cases</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cases">
                View all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <CaseRow
                caseNumber="CS-2024-1234"
                patient="John Anderson"
                type="Crown - Zirconia"
                status="In Production"
                dueDate="Jan 10, 2026"
              />
              <CaseRow
                caseNumber="CS-2024-1233"
                patient="Sarah Mitchell"
                type="Bridge - PFM"
                status="Quality Check"
                dueDate="Jan 9, 2026"
              />
              <CaseRow
                caseNumber="CS-2024-1232"
                patient="Michael Chen"
                type="Veneer - E-max"
                status="Shipped"
                dueDate="Jan 8, 2026"
              />
              <CaseRow
                caseNumber="CS-2024-1231"
                patient="Emily Davis"
                type="Crown - Zirconia"
                status="Delivered"
                dueDate="Jan 5, 2026"
              />
              <CaseRow
                caseNumber="CS-2024-1230"
                patient="Robert Wilson"
                type="Implant Crown"
                status="Submitted"
                dueDate="Jan 12, 2026"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Outstanding Invoices */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/cases/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit New Case
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/invoices">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Invoice
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/shipping/new">
                  <Truck className="mr-2 h-4 w-4" />
                  Create Shipping Label
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Outstanding Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                Outstanding Invoices
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/invoices">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <InvoiceRow
                  invoiceNumber="INV-5678"
                  amount="$850.00"
                  dueDate="Jan 15, 2026"
                  status="pending"
                />
                <InvoiceRow
                  invoiceNumber="INV-5677"
                  amount="$1,200.00"
                  dueDate="Jan 10, 2026"
                  status="overdue"
                />
                <InvoiceRow
                  invoiceNumber="INV-5676"
                  amount="$400.00"
                  dueDate="Jan 20, 2026"
                  status="pending"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function CaseRow({
  caseNumber,
  patient,
  type,
  status,
  dueDate,
}: {
  caseNumber: string;
  patient: string;
  type: string;
  status: string;
  dueDate: string;
}) {
  const statusColors: Record<string, string> = {
    Submitted: "bg-blue-100 text-blue-800",
    "In Production": "bg-yellow-100 text-yellow-800",
    "Quality Check": "bg-purple-100 text-purple-800",
    Shipped: "bg-green-100 text-green-800",
    Delivered: "bg-gray-100 text-gray-800",
  };

  return (
    <Link
      href={`/cases/${caseNumber}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{caseNumber}</span>
          <Badge
            variant="secondary"
            className={statusColors[status] || "bg-gray-100"}
          >
            {status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {patient} • {type}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">Due</p>
        <p className="text-sm font-medium">{dueDate}</p>
      </div>
    </Link>
  );
}

function InvoiceRow({
  invoiceNumber,
  amount,
  dueDate,
  status,
}: {
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  status: "pending" | "overdue";
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div>
        <p className="font-medium text-sm">{invoiceNumber}</p>
        <p className="text-xs text-muted-foreground">Due {dueDate}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">{amount}</p>
        <Badge
          variant={status === "overdue" ? "destructive" : "secondary"}
          className="text-xs"
        >
          {status === "overdue" ? "Overdue" : "Pending"}
        </Badge>
      </div>
    </div>
  );
}

