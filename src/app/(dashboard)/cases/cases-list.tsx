"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Case } from "@/types/database.types";

interface Props {
  cases: Case[];
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  received: {
    label: "Received",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: Package,
  },
  in_production: {
    label: "In Production",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    icon: Clock,
  },
  quality_check: {
    label: "Quality Check",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    icon: CheckCircle2,
  },
  ready_to_ship: {
    label: "Ready to Ship",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  on_hold: {
    label: "On Hold",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: AlertCircle,
  },
};

export function CasesList({ cases }: Props) {
  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No cases found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            You don&apos;t have any cases yet. Submit a new case to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {cases.map((caseItem) => {
        const status = statusConfig[caseItem.status || "received"] || statusConfig.received;
        const StatusIcon = status.icon;

        return (
          <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <StatusIcon className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {caseItem.case_number}
                    </span>
                    {caseItem.is_rush && (
                      <Badge variant="destructive" className="text-xs">
                        Rush
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium truncate">{caseItem.patient_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{caseItem.case_type}</span>
                    {caseItem.material && (
                      <>
                        <span>•</span>
                        <span>{caseItem.material}</span>
                      </>
                    )}
                    {caseItem.teeth_numbers && (
                      <>
                        <span>•</span>
                        <span>#{caseItem.teeth_numbers}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <Badge className={status.color} variant="secondary">
                      {status.label}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {caseItem.created_at &&
                        formatDistanceToNow(new Date(caseItem.created_at), {
                          addSuffix: true,
                        })}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

