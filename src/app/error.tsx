"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
        Something went wrong
      </p>
      <h1 className="text-3xl font-bold tracking-tight">Unexpected error</h1>
      {error.digest && (
        <p className="text-muted-foreground text-xs">Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded-md px-5 py-2 text-sm font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
