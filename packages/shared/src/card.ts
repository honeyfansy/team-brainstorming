export type BrainstormCardType =
  | 'idea'
  | 'pro'
  | 'con'
  | 'question'
  | 'action_item'
  | 'note';

export type CardStatus = 'active' | 'draft' | 'archived' | 'selected';

export interface BrainstormCard {
  id: string;
  type: BrainstormCardType;
  content: string;
  position: { x: number; y: number };
  author: string; // agent id
  status: CardStatus;
  phase: string;
  round: number;
  flowId: string;
  parentId?: string; // for replies / clustering
  tags: string[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, string>;
}

export const CARD_COLORS: Record<BrainstormCardType, { bg: string; border: string; label: string }> = {
  idea:        { bg: '#E3F2FD', border: '#2196F3', label: 'Idea' },
  pro:         { bg: '#E8F5E9', border: '#4CAF50', label: 'Pro' },
  con:         { bg: '#FFEBEE', border: '#F44336', label: 'Con' },
  question:    { bg: '#FFF3E0', border: '#FF9800', label: 'Question' },
  action_item: { bg: '#F3E5F5', border: '#9C27B0', label: 'Action' },
  note:        { bg: '#ECEFF1', border: '#607D8B', label: 'Note' },
};
