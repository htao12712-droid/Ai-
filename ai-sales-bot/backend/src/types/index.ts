export interface Entity {
  type: string;
  value: any;
  confidence: number;
  position: { start: number; end: number };
}

export interface ConversationContext {
  callId: string;
  turnCount: number;
  history: Array<{
    role: 'customer' | 'agent';
    text: string;
    timestamp: Date;
  }>;
  variables: Record<string, any>;
}

export interface CallTranscript {
  speaker: 'customer' | 'agent';
  text: string;
  timestamp: Date;
  confidence?: number;
}

export interface Feedback {
  type: 'product_quality' | 'price' | 'service' | 'feature' | 'other';
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: Date;
}

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: Entity[];
  suggestions: string[];
}

export interface ScriptNode {
  id: string;
  type: 'start' | 'question' | 'statement' | 'condition' | 'transfer' | 'end';
  content: string;
  intent?: string;
  nextNodeId?: string;
  branches?: {
    condition: string;
    nextNodeId: string;
  }[];
}

export interface ScriptEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ScriptContent {
  nodes: ScriptNode[];
  edges: ScriptEdge[];
}

export interface Call {
  id: string;
  taskId: string;
  customerId: string;
  scriptId: string;
  status: 'calling' | 'connected' | 'ended' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  transcript: CallTranscript[];
  intentAnalysis?: IntentResult;
  rating?: number;
}

export type CallStatus = 'calling' | 'connected' | 'ended' | 'failed';
