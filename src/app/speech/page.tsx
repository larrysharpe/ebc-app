import type { Metadata } from 'next';

import { ClubClimateCue } from '@/modules/speech-cue';

export const metadata: Metadata = {
  title: 'Meeting teleprompter — Club climate',
  description:
    'Toastmasters meeting teleprompter with timing lights for Creating the Best Club Climate.',
};

export default function SpeechCuePage() {
  return <ClubClimateCue />;
}
