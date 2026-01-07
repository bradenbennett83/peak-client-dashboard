"use client";

import { formatDistanceToNow } from "date-fns";
import { Package, Truck, Download, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type ShippingLabel } from "@/types/database.types";

interface Props {
  labels: ShippingLabel[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  created: {
    label: "Ready to Ship",
    color: "bg-blue-100 text-blue-800",
  },
  in_transit: {
    label: "In Transit",
    color: "bg-yellow-100 text-yellow-800",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
  },
};

export function ShippingLabelsList({ labels }: Props) {
  if (labels.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No shipping labels</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Create your first shipping label to send cases to Peak Dental
            Studio. It&apos;s free and easy!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {labels.map((label) => {
        const status = statusConfig[label.status || "created"] || statusConfig.created;

        return (
          <Card key={label.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-mono font-medium">{label.tracking_number}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{label.carrier}</span>
                  <span>•</span>
                  <span>{label.service}</span>
                  {label.created_at && (
                    <>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(label.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Badge className={status.color} variant="secondary">
                {status.label}
              </Badge>

              <div className="flex items-center gap-2">
                {label.label_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={label.label_url} download>
                      <Download className="mr-2 h-4 w-4" />
                      Label
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.ups.com/track?tracknum=${label.tracking_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Track
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

