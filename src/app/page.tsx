import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="font-mono text-4xl tracking-tight" style={{ color: 'var(--color-accent-green)' }}>
        CORESPACE
      </h1>
      <p className="max-w-md text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Spatial personal management system.
      </p>
      <Link
        href="/dashboard"
        className="rounded border px-6 py-2 text-sm font-medium transition-colors hover:bg-white/5"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-accent-green)',
        }}
      >
        Open Inventory
      </Link>
    </main>
  );
}
