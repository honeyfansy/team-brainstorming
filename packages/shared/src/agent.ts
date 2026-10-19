export type ThinkingStyle =
  | 'divergent'
  | 'critical'
  | 'synthesizer'
  | 'practical'
  | 'user_advocate'
  | 'neutral';

export const THINKING_STYLE_LABELS: Record<ThinkingStyle, { cn: string; desc: string }> = {
  divergent:     { cn: '发散者', desc: '天马行空出主意，数量优先，不批判' },
  critical:      { cn: '批判者', desc: '找漏洞、挑战假设、评估风险' },
  synthesizer:   { cn: '整合者', desc: '连接不同想法、提炼共识、归纳' },
  practical:     { cn: '实干者', desc: '落地可行性、成本、资源、时间' },
  user_advocate: { cn: '用户代言', desc: '从最终用户/客户视角发声' },
  neutral:       { cn: '中立观察', desc: '客观陈述事实和数据' },
};

export const THINKING_STYLE_COLORS: Record<ThinkingStyle, string> = {
  divergent:     '#2196F3',
  critical:      '#F44336',
  synthesizer:   '#9C27B0',
  practical:     '#4CAF50',
  user_advocate: '#FF9800',
  neutral:       '#607D8B',
};

/** Status of a brainstorm agent instance */
export type AgentStatusType = 'idle' | 'thinking' | 'speaking' | 'waiting' | 'done' | 'error';

export interface AgentStatusInfo {
  agentId: string;
  thinkingStyle: ThinkingStyle;
  perspective: string;
  label: string;
  color: string;
  model: string;
  status: AgentStatusType;
  message?: string;
  inputTokens?: number;
  outputTokens?: number;
}

/** Configuration for one brainstorm participant */
export interface BrainstormAgentConfig {
  id: string; // unique instance id e.g. "divergent-1"
  thinkingStyle: ThinkingStyle;
  perspective: string; // user-defined, e.g. "市场", "技术", "用户增长"
  label: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  color: string;
  enabled: boolean;
}

/** A message sent by an agent during discussion */
export interface AgentMessage {
  id: string;
  sessionId: string;
  from: string; // agent id
  to: string | 'all' | 'user';
  content: string;
  phase: string;
  timestamp: number;
  type: 'thought' | 'question' | 'decision' | 'action' | 'chat';
  actions?: CanvasAction[];
  inputTokens?: number;
  outputTokens?: number;
}

/** Internal reasoning step (may or may not be visible) */
export interface AgentThought {
  agentId: string;
  content: string;
  phase: string;
  visible: boolean;
}

/** Actions an agent can perform on the canvas */
export interface CanvasAction {
  type:
    | 'add_card'
    | 'add_cards'
    | 'remove_card'
    | 'update_card'
    | 'add_edge'
    | 'remove_edge'
    | 'invite_agent'
    | 'invite_all'
    | 'advance_phase'
    | 'request_decision'
    | 'wait_for_user'
    | 'summarize'
    | 'propose_card'
    | 'propose_edges'
    | 'disagree'
    | 'agree';
  payload: Record<string, unknown>;
}

/** A decision that needs user input */
export interface DecisionRequest {
  id: string;
  sessionId: string;
  phase: string;
  title: string;
  description: string;
  context: string[];
  options: DecisionOption[];
  from: string[];
  status: 'pending' | 'resolved' | 'skipped';
  createdAt: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
}

export interface DecisionResponse {
  requestId: string;
  optionId?: string;
  customInput?: string;
  action: 'select' | 'skip' | 'custom';
}
