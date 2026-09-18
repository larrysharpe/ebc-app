export { CursorPromptBar } from './features/cursor-prompt';
export type { CursorPromptBarProps } from './features/cursor-prompt';
export type {
  CursorPromptRequest,
  CursorStatusResponse,
  CursorStreamEvent,
} from './types/cursor.types';
export {
  extractAppActionsFromText,
  parseAppControlIntent,
  useAppControl,
} from './features/app-control';
