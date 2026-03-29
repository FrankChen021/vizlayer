export interface SequenceParticipant {
  id: string;
  label?: string;
}

export interface SequenceMessage {
  from: string;
  to: string;
  text: string;
}

export interface SequenceDiagramDocument {
  participants: SequenceParticipant[];
  messages: SequenceMessage[];
}
