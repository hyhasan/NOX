import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <SearchX className="h-20 w-20 text-secondary/30" />
      <h1 className="mt-6 font-heading text-4xl font-bold">Page Not Found</h1>
      <p className="mt-3 text-secondary/60 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild className="cursor-pointer">
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild className="cursor-pointer">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    </div>
  );
}
