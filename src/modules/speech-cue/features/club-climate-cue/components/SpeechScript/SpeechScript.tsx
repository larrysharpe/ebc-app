import type { ReactElement } from 'react';

import type { CueLine, SpeechCue } from '../../club-climate-cue.types';
import { splitEmphasis } from '../../club-climate-cue.utils';

import type { SpeechScriptProps } from './SpeechScript.types';

function EmphasizedText({ text }: { text: string }): ReactElement {
  return (
    <>
      {splitEmphasis(text).map((segment, index) =>
        segment.type === 'strong' ? (
          <strong key={`${segment.text}-${index}`} className="font-bold text-white">
            {segment.text}
          </strong>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}

function ScriptLine({ line }: { line: CueLine }): ReactElement {
  if (line.type === 'stage') {
    return (
      <p className="py-4 text-center text-[0.55em] font-semibold uppercase tracking-[0.18em] text-white/45">
        {line.text}
      </p>
    );
  }

  if (line.type === 'quote') {
    return (
      <blockquote className="border-l-4 border-white/40 pl-5 italic text-white">
        “<EmphasizedText text={line.text} />”
      </blockquote>
    );
  }

  if (line.type === 'bullet') {
    return (
      <p className="text-white">
        <span className="mr-3 text-white/70" aria-hidden>
          •
        </span>
        <EmphasizedText text={line.text} />
      </p>
    );
  }

  return (
    <p className="text-white">
      <EmphasizedText text={line.text} />
    </p>
  );
}

function ScriptSection({ cue, showSlide }: { cue: SpeechCue; showSlide: boolean }): ReactElement {
  return (
    <section className="space-y-5">
      {showSlide ? (
        <p className="pt-6 text-center text-[0.5em] font-semibold uppercase tracking-[0.22em] text-white/35">
          Slide {cue.slide}
        </p>
      ) : null}
      {cue.lines.map((line, index) => (
        <ScriptLine key={`${cue.id}-${index}`} line={line} />
      ))}
    </section>
  );
}

export function SpeechScript({ cues, fontScale }: SpeechScriptProps): ReactElement {
  return (
    <article
      className="mx-auto w-full max-w-4xl px-4 sm:px-8"
      style={{ fontSize: `${fontScale * 2.35}rem`, lineHeight: 1.55 }}
    >
      <div className="space-y-10">
        {cues.map((cue, index) => (
          <ScriptSection
            key={cue.id}
            cue={cue}
            showSlide={
              cue.slide >= 1 &&
              (index === 0 || cue.slide !== cues[index - 1]?.slide)
            }
          />
        ))}
      </div>
    </article>
  );
}
