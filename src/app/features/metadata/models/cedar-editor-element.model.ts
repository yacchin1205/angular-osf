export type CedarEditorTargetType = 'files' | 'nodes' | 'registrations';

export interface CedarEditorContext {
  target: {
    id: string;
    type: CedarEditorTargetType;
  };
  apiDomainUrl: string;
}

export interface CedarEditorElement extends HTMLElement {
  config?: unknown;
  context?: CedarEditorContext;
  templateObject?: unknown;
  metadata?: unknown;
  currentMetadata?: unknown;
  instanceObject?: unknown;
  dataQualityReport?: {
    isValid: boolean;
  };
}
