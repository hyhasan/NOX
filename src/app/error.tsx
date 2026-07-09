"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-6 font-heading text-2xl font-bold">Critical Error</h1>
          <p className="mt-3 text-sm text-secondary/60">
            {error.message || "A critical error occurred. Please refresh the page."}
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-secondary/40">
              Error ID: {error.digest}
            </p>
          )}
          <Button
            className="mt-8 cursor-pointer"
            onClick={() => reset()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </body>
    </html>
  );
}
