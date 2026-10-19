import type { BrainstormAgentConfig } from './agent.js';
import type { BrainstormCard } from './card.js';
import type { Edge } from './canvas.js';

export type SessionPhase =
  | 'warming_up'
  | 'divergence'
  | 'convergence'
  | 'clustering'
  | 'action_planning'
  | 'complete';

export type SessionStatus = 'idle' | 'running' | 'paused' | 'waiting_input' | 'complete' | 'error';

export type InterventionMode = 'automatic' | 'smart_pause' | 'manual';

export interface FlowConfig {
  id: string;
  name: string;
  description: string;
  phase: SessionPhase;
  phaseHistory: SessionPhase[];
  status: 'pending' | 'running' | 'complete';
}

export interface SessionConfig {
  topic: string;           // brainstorming topic
  subTopics: string[];     // optional sub-topics to structure discussion
  flows: FlowConfig[];
  agents: BrainstormAgentConfig[];
  interventionMode: InterventionMode;
  autoConfirmPhase: boolean;
  canvasChangeResponse: 'continue' | 'stop';
  llmProvider?: string;
  llmBaseURL?: string;
  llmApiKey?: string;
}

export interface Session {
  id: string;
  name: string;
  config: SessionConfig;
  status: SessionStatus;
  currentFlowIndex: number;
  phase: SessionPhase;
  phaseHistory: SessionPhase[];
  canvas: {
    cards: BrainstormCard[];
    edges: Edge[];
  };
  createdAt: number;
  updatedAt: number;
  pendingDecisions: number;
  unresolvedCount: number;
}
