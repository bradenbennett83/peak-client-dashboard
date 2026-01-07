import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  FileText,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { requireUserWithProfile } from "@/lib/auth/get-user";

interface Props {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  received: {
    label: "Received",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  in_production: {
    label: "In Production",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  quality_check: {
    label: "Quality Check",
    color: "bg-purple-100 text-purple-800",
    icon: CheckCircle2,
  },
  ready_to_ship: {
    label: "Ready to Ship",
    color: "bg-orange-100 text-orange-800",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "bg-green-100 text-green-800",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
  },
  on_hold: {
    label: "On Hold",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
};

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();

  const { data: caseData, error } = await supabase
    .from("cases")
    .select("*, case_files(*)")
    .eq("id", id)
    .eq("practice_id", profile?.practice_id)
    .single();

  if (error || !caseData) {
    notFound();
  }

  const status = statusConfig[caseData.status || "received"] || statusConfig.received;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Back Button and Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link href="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cases
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-light tracking-tight">
              {caseData.patient_name}
            </h1>
            {caseData.is_rush && (
              <Badge variant="destructive">Rush</Badge>
            )}
          </div>
          <p className="text-muted-foreground font-mono">
            Case #{caseData.case_number}
          </p>
        </div>

        <Badge className={`${status.color} gap-1.5`} variant="secondary">
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Details */}
          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Case Type</p>
                <p className="font-medium">{caseData.case_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Material</p>
                <p className="font-medium">{caseData.material || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shade</p>
                <p className="font-medium">{caseData.shade || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teeth Numbers</p>
                <p className="font-medium">{caseData.teeth_numbers || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">
                  {caseData.due_date
                    ? format(new Date(caseData.due_date), "MMM d, yyyy")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Received Date</p>
                <p className="font-medium">
                  {caseData.received_date
                    ? format(new Date(caseData.received_date), "MMM d, yyyy")
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {caseData.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {caseData.instructions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Case Files */}
          <Card>
            <CardHeader>
              <CardTitle>Files & Attachments</CardTitle>
              <CardDescription>
                Digital scans, photos, and other files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {caseData.case_files && caseData.case_files.length > 0 ? (
                <div className="space-y-2">
                  {caseData.case_files.map((file: { id: string; file_name: string; file_type: string; file_url: string }) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.file_type}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No files attached to this case
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tracking */}
          {caseData.tracking_number && (
            <Card>
              <CardHeader>
                <CardTitle>Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Carrier</p>
                    <p className="font-medium">{caseData.carrier || "UPS"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tracking Number
                    </p>
                    <p className="font-mono font-medium">
                      {caseData.tracking_number}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <a
                      href={`https://www.ups.com/track?tracknum=${caseData.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Track Shipment
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  title="Case Created"
                  date={caseData.created_at}
                  completed
                />
                {caseData.received_date && (
                  <TimelineItem
                    title="Received at Lab"
                    date={caseData.received_date}
                    completed
                  />
                )}
                {caseData.shipped_date && (
                  <TimelineItem
                    title="Shipped"
                    date={caseData.shipped_date}
                    completed
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {caseData.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Lab Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {caseData.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  title,
  date,
  completed,
}: {
  title: string;
  date: string | null;
  completed?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full ${
            completed ? "bg-primary" : "bg-muted"
          }`}
        />
        <Separator orientation="vertical" className="h-full my-1" />
      </div>
      <div className="pb-4">
        <p className={`font-medium ${completed ? "" : "text-muted-foreground"}`}>
          {title}
        </p>
        {date && (
          <p className="text-sm text-muted-foreground">
            {format(new Date(date), "MMM d, yyyy 'at' h:mm a")}
          </p>
        )}
      </div>
    </div>
  );
}

