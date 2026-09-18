import type { LegalDocumentProps } from './legal-document.types';

function formatLastUpdated(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <article className="space-y-8">
      <header>
        <p className="ebc-section-label">EBC APP</p>
        <h1 className="mt-1 text-2xl font-bold text-ebc-burgundy sm:text-3xl">
          {document.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated {formatLastUpdated(document.lastUpdated)}
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-700">{document.intro}</p>
      </header>

      {document.sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <h2 className="text-lg font-bold text-ebc-burgundy">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-base leading-relaxed text-slate-700">
              {paragraph}
            </p>
          ))}
          {section.bullets && section.bullets.length > 0 ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-slate-700">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
