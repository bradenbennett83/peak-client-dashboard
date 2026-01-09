"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  // Step 1: Patient Information
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  patientDOB: z.date().optional(),
  
  // Step 2: Case Details
  restorationType: z.string().min(1, "Please select a restoration type"),
  material: z.string().optional(),
  toothNumbers: z.string().min(1, "Please enter at least one tooth number"),
  shade: z.string().optional(),
  
  // Step 3: Timeline & Instructions
  dueDate: z.date(),
  isRush: z.boolean(),
  specialInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const RESTORATION_TYPES = [
  "Crown",
  "Bridge",
  "Veneer",
  "Inlay/Onlay",
  "Denture - Full",
  "Denture - Partial",
  "Implant Crown",
  "Implant Bridge",
  "Night Guard",
  "Other",
];

const MATERIALS = [
  "Zirconia",
  "E-max",
  "PFM (Porcelain Fused to Metal)",
  "Full Gold",
  "Composite",
  "Acrylic",
];

const SHADES = [
  "A1",
  "A2",
  "A3",
  "A3.5",
  "A4",
  "B1",
  "B2",
  "B3",
  "B4",
  "C1",
  "C2",
  "C3",
  "C4",
  "D2",
  "D3",
  "D4",
];

export function NewCaseForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      restorationType: "",
      material: "",
      toothNumbers: "",
      shade: "",
      isRush: false,
      specialInstructions: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: values.patientName,
          patientDOB: values.patientDOB ? format(values.patientDOB, "yyyy-MM-dd") : undefined,
          restorationType: values.restorationType,
          material: values.material,
          shade: values.shade,
          toothNumbers: values.toothNumbers,
          dueDate: format(values.dueDate, "yyyy-MM-dd"),
          isRush: values.isRush,
          specialInstructions: values.specialInstructions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit case");
      }

      const data = await response.json();

      toast.success(`Case ${data.case.caseNumber} submitted successfully!`);
      router.push("/cases");
    } catch (error) {
      console.error("Case submission error:", error);
      toast.error("Failed to submit case. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["patientName"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["restorationType", "toothNumbers"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Full name of the patient for this case
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientDOB"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Patient Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Optional - helps with patient identification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="restorationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restoration Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select restoration type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RESTORATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MATERIALS.map((material) => (
                        <SelectItem key={material} value={material}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toothNumbers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tooth Numbers *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 8, 9 or 14-16" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter tooth numbers (e.g., "8, 9" or "14-16")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SHADES.map((shade) => (
                        <SelectItem key={shade} value={shade}>
                          {shade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When do you need this case completed?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRush"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Rush Case</FormLabel>
                    <FormDescription>
                      Mark as rush for expedited processing (2-3 day turnaround)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special instructions or notes for the lab..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include any special requests or important details
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  currentStep > step
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {currentStep > step ? <Check className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={cn(
                    "h-0.5 w-12 transition-colors",
                    currentStep > step ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Patient Information"}
              {currentStep === 2 && "Case Details"}
              {currentStep === 3 && "Timeline & Instructions"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter patient information for this case"}
              {currentStep === 2 && "Specify the restoration details"}
              {currentStep === 3 && "Set timeline and add any special instructions"}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button type="button" onClick={nextStep} disabled={isSubmitting}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Case"
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

