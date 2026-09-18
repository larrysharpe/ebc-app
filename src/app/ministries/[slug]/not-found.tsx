import Link from 'next/link';

export default function MinistryNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold text-ebc-burgundy">Ministry not found</h1>
      <Link href="/ministries" className="font-medium text-ebc-navy underline">
        Back to ministries
      </Link>
    </div>
  );
}
