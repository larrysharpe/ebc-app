export type AppNavigateAction = {
  type: 'navigate';
  path: string;
  label: string;
};

export type AppAction = AppNavigateAction;

export type AppControlParseResult = {
  action: AppAction;
  confidence: 'high' | 'medium';
};
