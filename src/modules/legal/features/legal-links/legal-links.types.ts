export type LegalLinksVariant = 'onLight' | 'onDark' | 'inline';

export type LegalLinksProps = {
  variant?: LegalLinksVariant;
  /** Current document slug — that link is not repeated. */
  currentSlug?: 'privacy' | 'terms';
  className?: string;
};
