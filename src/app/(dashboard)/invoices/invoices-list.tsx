"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Receipt, ChevronRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Invoice } from "@/types/database.types";

interface Props {
  invoices: Invoice[];
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    icon: Clock,
  },
  unpaid: {
    label: "Unpaid",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    icon: Receipt,
  },
};

function getInvoiceStatus(invoice: Invoice): string {
  if (invoice.status === "paid") return "paid";
  if (invoice.status === "cancelled") return "cancelled";
  
  if (invoice.due_date && new Date(invoice.due_date) < new Date()) {
    return "overdue";
  }
  
  return invoice.status || "pending";
}

export function InvoicesList({ invoices }: Props) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No invoices found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            You don&apos;t have any invoices yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => {
        const invoiceStatus = getInvoiceStatus(invoice);
        const status = statusConfig[invoiceStatus] || statusConfig.pending;
        const StatusIcon = status.icon;
        const remaining = (invoice.amount || 0) - (invoice.amount_paid || 0);

        return (
          <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    Invoice #{invoice.invoice_number}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {invoice.due_date && (
                      <span>
                        Due {format(new Date(invoice.due_date), "MMM d, yyyy")}
                      </span>
                    )}
                    {invoice.description && (
                      <>
                        <span>•</span>
                        <span className="truncate">{invoice.description}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    ${invoice.amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  {remaining > 0 && remaining !== invoice.amount && (
                    <p className="text-xs text-muted-foreground">
                      ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })} due
                    </p>
                  )}
                </div>

                <Badge className={`${status.color} gap-1`} variant="secondary">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>

                {invoiceStatus !== "paid" && invoiceStatus !== "cancelled" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/invoices/${invoice.id}?pay=true`;
                    }}
                  >
                    Pay Now
                  </Button>
                )}

                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

