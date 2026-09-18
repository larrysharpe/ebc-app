import { getLegalDocument, LegalDocument, LegalPageShell } from '@/modules/legal';

export default function PrivacyPolicyPage() {
  const document = getLegalDocument('privacy');

  return (
    <LegalPageShell currentSlug="privacy">
      <LegalDocument document={document} />
    </LegalPageShell>
  );
}
