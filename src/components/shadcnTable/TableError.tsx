"use client";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TableErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function TableError({
  title = "Something went wrong",
  message = "There was an error loading the table data. Please try again.",
  onRetry,
}: TableErrorProps) {
  return (
    <Card className="w-full border border-destructive/20 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg
              className="h-full w-full animate-pulse text-destructive/20"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
              />
            </svg>
            <AlertCircle className="absolute h-10 w-10 text-destructive" />
          </div>
          <p className="text-center text-muted-foreground">{message}</p>
        </div>
      </CardContent>
      {onRetry && (
        <CardFooter className="flex justify-center pb-6 pt-0">
          <Button
            variant="outline"
            className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4 animate-spin-slow" />
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
