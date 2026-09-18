import Link from 'next/link';

import { LegalPageShell, listLegalDocuments } from '@/modules/legal';

export default function LegalHubPage() {
  const documents = listLegalDocuments();

  return (
    <LegalPageShell>
      <p className="ebc-section-label">EBC APP</p>
      <h1 className="mt-1 text-2xl font-bold text-ebc-burgundy sm:text-3xl">
        Privacy and terms
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-700">
        How Ebenezer Baptist Church uses this staff app, who may see church information, and
        the rules for people with an account.
      </p>
      <ul className="mt-8 space-y-3">
        {documents.map((document) => (
          <li key={document.slug}>
            <Link
              href={`/legal/${document.slug}`}
              className="ebc-choice block rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-ebc-burgundy/40"
            >
              <span className="text-base font-semibold text-ebc-burgundy">{document.title}</span>
              <span className="mt-1 block text-sm text-slate-600">
                {document.slug === 'privacy'
                  ? 'What we collect, who may see it, children, prayer, and giving.'
                  : 'Who may use this app and how to handle church information.'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </LegalPageShell>
  );
}
