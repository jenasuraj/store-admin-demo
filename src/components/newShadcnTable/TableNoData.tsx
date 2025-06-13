"use client";

import type * as React from "react";
import { Database, FileSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TableNoDataProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function TableNoData({
  title = "No data available",
  message = "There are no items to display at this time.",
  actionLabel = "Add new item",
  onAction,
  icon = <FileSearch className="h-10 w-10 text-muted-foreground" />,
}: TableNoDataProps) {
  return (
    <Card className="w-full border border-muted bg-muted/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Database className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg
              className="h-full w-full text-muted/20"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="20"
                y="20"
                width="60"
                height="60"
                rx="4"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray="8 8"
                className="animate-dash"
              />
            </svg>
            <div className="absolute animate-float">{icon}</div>
          </div>
          <p className="text-center text-muted-foreground">{message}</p>
        </div>
      </CardContent>
      {onAction && (
        <CardFooter className="flex justify-center pb-6 pt-0">
          <Button variant="outline" className="gap-2" onClick={onAction}>
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
