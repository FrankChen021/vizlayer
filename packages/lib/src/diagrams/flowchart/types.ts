export interface FlowchartNode {
  id: string;
  label: string;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowchartDocument {
  title?: string;
  direction?: "TB" | "TD" | "LR" | "RL" | "BT";
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}
