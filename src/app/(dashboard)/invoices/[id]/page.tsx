import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { requireUserWithProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getInvoiceById } from "@/lib/salesforce/invoices";
import { PaymentForm } from "./payment-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { profile } = await requireUserWithProfile();
  const supabase = await createClient();
  const { id } = await params;

  // Get practice with Salesforce account ID
  const { data: practice } = await supabase
    .from("practices")
    .select("id, name, salesforce_account_id, stripe_customer_id")
    .eq("id", profile?.practice_id)
    .single();

  if (!practice) {
    notFound();
  }

  // Fetch invoice from Salesforce
  let invoice;
  try {
    invoice = await getInvoiceById(id);
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    notFound();
  }

  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";
  const remainingBalance = invoice.amount - invoice.amountPaid;

  const statusColor = isPaid
    ? "default"
    : isOverdue
    ? "destructive"
    : "secondary";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/invoices">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight font-serif">
            Invoice {invoice.invoiceNumber}
          </h1>
          <p className="text-muted-foreground">
            {invoice.description || "Invoice details and payment"}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice Summary</CardTitle>
              <CardDescription>
                Created on {format(new Date(invoice.createdAt), "MMMM d, yyyy")}
              </CardDescription>
            </div>
            <Badge variant={statusColor} className="capitalize">
              {invoice.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">
                {invoice.dueDate
                  ? format(new Date(invoice.dueDate), "MMMM d, yyyy")
                  : "N/A"}
              </p>
            </div>
            {isPaid && invoice.paidDate && (
              <div>
                <p className="text-sm text-muted-foreground">Paid Date</p>
                <p className="font-medium">
                  {format(new Date(invoice.paidDate), "MMMM d, yyyy")}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="font-medium mb-4">Line Items</h3>
            {invoice.lineItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${item.unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2" />
                <p>No line items available</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${invoice.amount.toFixed(2)}</span>
            </div>
            {invoice.amountPaid > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-green-600">
                  -${invoice.amountPaid.toFixed(2)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>{isPaid ? "Total Paid" : "Amount Due"}</span>
              <span>${remainingBalance.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form - Only show if not fully paid */}
      {!isPaid && remainingBalance > 0 && (
        <PaymentForm
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          amount={remainingBalance}
          practiceId={practice.id}
          stripeCustomerId={practice.stripe_customer_id}
        />
      )}

      {/* Paid Message */}
      {isPaid && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <ArrowLeft className="h-4 w-4 text-white transform rotate-180" />
              </div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Payment Received
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  This invoice has been paid in full on{" "}
                  {invoice.paidDate
                    ? format(new Date(invoice.paidDate), "MMMM d, yyyy")
                    : "file"}
                  . Thank you for your payment!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

