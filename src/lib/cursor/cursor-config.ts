export type CursorConfig = {
  apiKey: string | undefined;
  model: string;
  cloudRepo: string | undefined;
  enabled: boolean;
};

export function getCursorConfig(): CursorConfig {
  const apiKey = process.env.CURSOR_API_KEY?.trim() || undefined;
  const model = process.env.CURSOR_MODEL?.trim() || 'composer-2.5';
  const cloudRepo = process.env.CURSOR_CLOUD_REPO?.trim() || undefined;

  return {
    apiKey,
    model,
    cloudRepo,
    enabled: Boolean(apiKey),
  };
}
