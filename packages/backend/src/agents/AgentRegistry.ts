import type { BrainstormAgentConfig, SessionConfig } from '@team-brainstorming/shared';
import { FacilitatorAgent } from './FacilitatorAgent.js';
import { BrainstormerAgent } from './BrainstormerAgent.js';
import { BaseAgent } from './BaseAgent.js';
import { AGENT_SYSTEM_PROMPTS } from '../orchestrator/phases.js';

export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();

  constructor(config: SessionConfig) {
    for (const ac of config.agents) {
      if (!ac.enabled) continue;
      const detailedPrompt = AGENT_SYSTEM_PROMPTS[ac.thinkingStyle] || AGENT_SYSTEM_PROMPTS.default;
      const agent = this.createAgent({
        ...ac,
        systemPrompt: ac.systemPrompt || detailedPrompt,
      });
      if (agent) this.agents.set(ac.id, agent);
    }
  }

  private createAgent(ac: BrainstormAgentConfig): BaseAgent | null {
    // Facilitator uses special class; all others use BrainstormerAgent
    if (ac.thinkingStyle === 'neutral' && ac.perspective === 'facilitator') {
      return new FacilitatorAgent(ac);
    }
    return new BrainstormerAgent(ac);
  }

  get(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  getAll(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  getActiveAgentIds(): string[] {
    return Array.from(this.agents.keys());
  }

  getByThinkingStyle(style: string): BaseAgent[] {
    return this.getAll().filter((a) => a.config.thinkingStyle === style);
  }

  getNonFacilitator(): BaseAgent[] {
    return this.getAll().filter((a) => !(a.config.thinkingStyle === 'neutral' && a.config.perspective === 'facilitator'));
  }
}
