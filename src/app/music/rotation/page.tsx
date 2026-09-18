import { redirect } from 'next/navigation';

/** @deprecated Use /music/choirs (Choir setup). */
export default function MusicRotationRedirectPage() {
  redirect('/music/choirs');
}
