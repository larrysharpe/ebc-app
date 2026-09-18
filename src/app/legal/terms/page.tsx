import { getLegalDocument, LegalDocument, LegalPageShell } from '@/modules/legal';

export default function TermsOfUsePage() {
  const document = getLegalDocument('terms');

  return (
    <LegalPageShell currentSlug="terms">
      <LegalDocument document={document} />
    </LegalPageShell>
  );
}
