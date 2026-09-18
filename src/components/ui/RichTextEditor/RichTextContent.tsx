'use client';

import DOMPurify from 'isomorphic-dompurify';

import { looksLikeHtml } from './rich-text.utils';

export type RichTextContentProps = {
  value: string;
  className?: string;
};

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'span',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
};

export function RichTextContent({
  value,
  className,
}: RichTextContentProps): React.ReactElement {
  const baseClass =
    className ?? 'text-sm leading-relaxed text-slate-700 [&_a]:font-medium [&_a]:text-ebc-green [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5';

  if (!looksLikeHtml(value)) {
    return <div className={`${baseClass} whitespace-pre-wrap`}>{value}</div>;
  }

  const html = DOMPurify.sanitize(value, PURIFY_CONFIG);
  return (
    <div
      className={baseClass}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
