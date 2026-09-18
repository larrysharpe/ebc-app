'use client';

import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

import {
  normalizeRichTextValue,
  plainTextToEditorHtml,
} from './rich-text.utils';

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Optional name for a hidden input (form posts). */
  name?: string;
  className?: string;
  minHeightClassName?: string;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-2.5 text-sm font-semibold transition ${
        active
          ? 'border-ebc-burgundy bg-ebc-burgundy text-white'
          : 'border-slate-300 bg-white text-slate-700 hover:border-ebc-burgundy/40'
      } disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'Write your message…',
  disabled = false,
  name,
  className,
  minHeightClassName = 'min-h-[9rem]',
}: RichTextEditorProps): React.ReactElement {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: plainTextToEditorHtml(value),
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `ebc-rich-text-editor ${minHeightClassName} px-3 py-2.5 text-sm leading-relaxed text-slate-800 outline-none [&_a]:text-ebc-green [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5`,
        'aria-label': label ?? 'Message',
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      onChange(normalizeRichTextValue(html) ?? '');
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const nextHtml = plainTextToEditorHtml(value);
    const current = normalizeRichTextValue(editor.getHTML()) ?? '';
    const incoming = normalizeRichTextValue(value) ?? '';
    if (current === incoming) return;
    editor.commands.setContent(nextHtml, { emitUpdate: false });
  }, [editor, value]);

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const next = window.prompt('Link URL', previous ?? 'https://');
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
  }

  const savedValue = normalizeRichTextValue(value) ?? '';

  return (
    <div className={className}>
      {label ? (
        <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      {name ? <input type="hidden" name={name} value={savedValue} /> : null}

      <div
        className={`overflow-hidden rounded-lg border border-slate-300 bg-white ${
          disabled ? 'opacity-60' : ''
        }`}
      >
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 bg-slate-50 p-2">
          <ToolbarButton
            label="B"
            active={editor?.isActive('bold')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="I"
            active={editor?.isActive('italic')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="• List"
            active={editor?.isActive('bulletList')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="1. List"
            active={editor?.isActive('orderedList')}
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            label="Link"
            active={editor?.isActive('link')}
            disabled={!editor || disabled}
            onClick={setLink}
          />
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
