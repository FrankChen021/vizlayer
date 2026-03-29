export interface ClassMember {
  name: string;
  type?: string;
}

export interface ClassRelation {
  from: string;
  to: string;
  label?: string;
}

export interface ClassDiagramDocument {
  classes: Array<{
    id: string;
    members?: ClassMember[];
  }>;
  relations?: ClassRelation[];
}
