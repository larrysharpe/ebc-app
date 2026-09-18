import { redirect } from 'next/navigation';

type MembersIdRedirectPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MembersIdRedirectPage({
  params,
  searchParams,
}: MembersIdRedirectPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }
  const suffix = qs.toString();
  redirect(suffix ? `/people/${id}?${suffix}` : `/people/${id}`);
}
