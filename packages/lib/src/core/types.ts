export type VisualizationKind = "flowchart" | "sequence" | "unknown";

export type DiagnosticCode =
  | "EMPTY_INPUT"
  | "UNKNOWN_KIND"
  | "MISSING_HEADER"
  | "MISSING_SEQUENCE_INTERACTION"
  | "MISSING_FLOW_CONTENT";

export type FixCode =
  | "UNWRAP_MARKDOWN_FENCE"
  | "NORMALIZE_LINE_ENDINGS"
  | "QUOTE_SEQUENCE_ALIAS_LABEL"
  | "ESCAPE_SEQUENCE_SEMICOLONS";

export type ResidualCode =
  | "EMPTY_INPUT"
  | "UNKNOWN_KIND"
  | "MISSING_HEADER"
  | "MISSING_SEQUENCE_INTERACTION"
  | "MISSING_FLOW_CONTENT";

export interface Diagnostic {
  code: DiagnosticCode;
  message: string;
}

export interface FixRecord {
  code: FixCode;
  description: string;
  changed: boolean;
}

export interface ResidualError {
  code: ResidualCode;
  message: string;
  phase: "input" | "repair" | "final-validate";
}

export interface ValidateSuccessResult {
  ok: true;
  kind: VisualizationKind;
  diagnostics: Diagnostic[];
}

export interface ValidateFailureResult {
  ok: false;
  kind: VisualizationKind;
  diagnostics: Diagnostic[];
}

export type ValidateResult = ValidateSuccessResult | ValidateFailureResult;

export interface RepairSuccessResult {
  ok: true;
  mermaid: string;
  kind: VisualizationKind;
  fixes: FixRecord[];
  residuals: ResidualError[];
}

export interface RepairFailureResult {
  ok: false;
  mermaid: string;
  kind: VisualizationKind;
  fixes: FixRecord[];
  residuals: ResidualError[];
}

export type RepairResult = RepairSuccessResult | RepairFailureResult;
