export { explain } from "./core/explain";
export { repair } from "./core/repair";
export { validate } from "./core/validate";
export { fromFlowchartJson as fromJson } from "./diagrams/flowchart/impl";

export type {
  Diagnostic,
  FixRecord,
  RepairResult,
  ResidualError,
  ValidateResult,
  VisualizationKind,
} from "./core/types";
export type {
  FlowchartDocument,
  FlowchartEdge,
  FlowchartNode,
} from "./diagrams/flowchart/types";
export type {
  SequenceDiagramDocument,
  SequenceMessage,
  SequenceParticipant,
} from "./diagrams/sequence/types";
export type {
  ClassDiagramDocument,
  ClassMember,
  ClassRelation,
} from "./diagrams/class/types";
