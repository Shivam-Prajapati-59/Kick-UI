import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
        404
      </p>
      <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded-md px-5 py-2 text-sm font-medium transition-colors"
      >
        Back home
      </Link>
    </div>
  );
}
