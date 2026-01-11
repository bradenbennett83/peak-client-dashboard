import { Mail, Phone, FileText, HelpCircle, Package, CreditCard, Truck } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { requireUserWithProfile } from "@/lib/auth/get-user";

export default async function HelpPage() {
  await requireUserWithProfile();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight font-serif">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and get in touch with our team
        </p>
      </div>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Our team is here to help with any questions or issues
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Email Support</p>
              <a
                href="mailto:support@peakdentalstudio.com"
                className="text-sm text-primary hover:underline"
              >
                support@peakdentalstudio.com
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                Response within 24 hours
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Phone Support</p>
              <a
                href="tel:+18005551234"
                className="text-sm text-primary hover:underline"
              >
                (800) 555-1234
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                Mon-Fri, 8am-6pm EST
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to common questions about using the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Cases FAQs */}
            <AccordionItem value="case-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  How do I submit a new case?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    To submit a new case, click the &quot;Submit New Case&quot; button on the
                    dashboard or navigate to Cases → Submit New Case.
                  </p>
                  <p>You&apos;ll need to provide:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Patient information (name, date of birth)</li>
                    <li>Restoration type and material</li>
                    <li>Tooth numbers</li>
                    <li>Shade selection</li>
                    <li>Due date and urgency</li>
                    <li>Any special instructions</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="case-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  What do the different case statuses mean?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <ul className="space-y-2">
                    <li>
                      <strong>Submitted:</strong> Case received and being reviewed by our team
                    </li>
                    <li>
                      <strong>In Production:</strong> Case is actively being fabricated
                    </li>
                    <li>
                      <strong>Quality Check:</strong> Final inspection before shipping
                    </li>
                    <li>
                      <strong>Shipped:</strong> Case is on its way to your practice
                    </li>
                    <li>
                      <strong>Delivered:</strong> Case has been delivered
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="case-3">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  How long does it take to complete a case?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Standard turnaround time is 5-7 business days from receipt of impressions.
                    Rush cases can be completed in 2-3 business days for an additional fee.
                  </p>
                  <p>
                    Turnaround times may vary based on case complexity and current lab volume.
                    You&apos;ll receive notifications as your case progresses.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Invoices FAQs */}
            <AccordionItem value="invoice-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  How do I pay an invoice?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Navigate to the Invoices page and click on any pending invoice. You can pay
                    using a credit card or saved payment method.
                  </p>
                  <p>
                    We accept Visa, Mastercard, American Express, and Discover. Payment is
                    processed securely through Stripe.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="invoice-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  When are invoices due?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Invoices are typically due within 30 days of issue. You&apos;ll receive email
                    reminders as the due date approaches.
                  </p>
                  <p>
                    If you need to discuss payment terms or have billing questions, please
                    contact our billing department at billing@peakdentalstudio.com.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Shipping FAQs */}
            <AccordionItem value="shipping-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  How do I track my shipment?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    When your case ships, you&apos;ll receive a notification with a tracking number.
                    You can also view tracking information on the case detail page.
                  </p>
                  <p>
                    All shipments are sent via UPS with tracking and signature confirmation.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shipping-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  How do I create a prepaid shipping label?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Navigate to Shipping → Create Label. Enter your return address and we&apos;ll
                    generate a prepaid UPS label for sending impressions to our lab.
                  </p>
                  <p>
                    The label will be emailed to you and can also be downloaded from the
                    Shipping page.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Account FAQs */}
            <AccordionItem value="account-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  How do I update my practice information?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Go to Settings → Practice Profile to update your practice name, contact
                    information, and addresses.
                  </p>
                  <p>
                    Make sure your shipping address is accurate to ensure cases are delivered
                    to the correct location.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  How do I add team members to my account?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Admin users can invite team members by going to Settings → Team Members →
                    Invite User.
                  </p>
                  <p>
                    Team members will receive an email invitation to create their account. You
                    can assign them either Admin or Staff roles.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>
            Documentation and guides to help you get the most out of the portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/cases/new">
              <FileText className="mr-2 h-4 w-4" />
              Case Submission Guide
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a
              href="https://peakdentalstudio.com/shade-guide"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="mr-2 h-4 w-4" />
              Shade Selection Guide
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a
              href="https://peakdentalstudio.com/materials"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="mr-2 h-4 w-4" />
              Materials & Pricing
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

