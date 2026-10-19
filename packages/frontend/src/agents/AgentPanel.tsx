import React, { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '../store/useSessionStore.js';
import { AgentRoster } from '../components/AgentRoster.js';
import { THINKING_STYLE_COLORS, type ThinkingStyle } from '@team-brainstorming/shared';
import type { AgentMessage, DecisionRequest } from '@team-brainstorming/shared';

const TYPE_ICONS: Record<string, string> = {
  thought: '💭',
  question: '❓',
  decision: '✅',
  action: '⚡',
  chat: '💬',
};

export function AgentPanel() {
  const messages = useSessionStore((s) => s.messages);
  const phase = useSessionStore((s) => s.phase);
  const status = useSessionStore((s) => s.status);
  const agentStatuses = useSessionStore((s) => s.agentStatuses);
  const sendInput = useSessionStore((s) => s.sendInput);
  const pendingDecision = useSessionStore((s) => s.pendingDecision);
  const sendDecision = useSessionStore((s) => s.sendDecision);
  const sendControl = useSessionStore((s) => s.sendControl);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const getAgentLabel = (agentId: string): string => {
    const agent = agentStatuses.find((a) => a.agentId === agentId);
    return agent?.label || agentId;
  };

  const getAgentColor = (agentId: string): string => {
    if (agentId === 'facilitator' || agentId === '引导者') return '#9E9E9E';
    const agent = agentStatuses.find((a) => a.agentId === agentId);
    return agent?.color || THINKING_STYLE_COLORS[agent?.thinkingStyle as ThinkingStyle] || '#999';
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (pendingDecision) {
      sendDecision(pendingDecision.id, undefined, input.trim());
    } else {
      sendInput(input.trim());
    }
    setInput('');
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>讨论面板</h3>
        <span style={{
          ...styles.statusDot,
          background: status === 'running' ? '#4CAF50' : status === 'waiting_input' ? '#FF9800' : '#999',
        }} />
        <span style={styles.statusText}>{status}</span>
      </div>
      <AgentRoster />

      {/* Control bar with waiting badge and pause/continue */}
      <div style={styles.controlBar}>
        <div style={{ display: 'flex', gap: 6 }}>
          {status === 'waiting_input' && <span style={styles.waitingBadge}>⏳ 等待你的输入</span>}
          {status === 'running' ? (
            <button onClick={() => sendControl('pause')} style={styles.ctrlBtn}>⏸ 暂停</button>
          ) : status === 'paused' ? (
            <button onClick={() => sendControl('resume')} style={styles.ctrlBtn}>▶ 继续</button>
          ) : status === 'complete' ? (
            <span style={{ fontSize: 11, color: '#4CAF50', fontWeight: 600 }}>✅ 已完成</span>
          ) : null}
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>等待 Agent 开始讨论...</div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{
            ...styles.message,
            borderLeftColor: getAgentColor(msg.from),
            background: msg.type === 'chat' ? '#f0f4ff' : 'white',
          }}>
            <div style={styles.msgHeader}>
              <span style={styles.typeIcon}>{TYPE_ICONS[msg.type] || '💭'}</span>
              <span style={{ ...styles.roleLabel, color: getAgentColor(msg.from) }}>
                {getAgentLabel(msg.from)}
              </span>
              <span style={styles.msgTime}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div style={styles.msgContent}>{msg.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {status === 'waiting_input' ? (
        <div>
          {pendingDecision && pendingDecision.options.length > 0 && (
            <div style={styles.decisionOptions}>
              <div style={styles.decisionPrompt}>{pendingDecision.description}</div>
              <div style={styles.optionRow}>
                {pendingDecision.options.map((opt) => (
                  <button key={opt.id} onClick={() => sendDecision(pendingDecision.id, opt.id)} style={styles.optionBtn}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={styles.inputArea}>
            <input
              style={styles.input}
              placeholder={pendingDecision ? '或输入自定义内容...' : '输入你的回应...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoFocus
            />
            <button onClick={handleSend} style={styles.sendBtn}>发送</button>
          </div>
        </div>
      ) : status === 'running' ? (
        <div style={styles.runningBanner}>
          <span style={styles.runningDot} />
          Agent 正在自动讨论中...
        </div>
      ) : (
        <div style={styles.runningBanner}>
          {status === 'paused' ? '⏸ 已暂停' : status === 'complete' ? '✅ 已完成' : `状态: ${status}`}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 360,
    display: 'flex', flexDirection: 'column',
    borderLeft: '1px solid #e0e0e0',
    background: '#fafafa',
    flexShrink: 0,
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'white',
  },
  headerTitle: { fontSize: 15, fontWeight: 600, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: '50%' },
  statusText: { fontSize: 12, color: '#666' },
  controlBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 10px', borderBottom: '1px solid #e0e0e0',
    background: '#f8f9fa', flexShrink: 0,
  },
  ctrlBtn: {
    padding: '3px 10px', borderRadius: 5, border: '1px solid #ccc',
    cursor: 'pointer', background: 'white', fontSize: 11, fontWeight: 600, color: '#555',
  },
  waitingBadge: {
    fontSize: 11, fontWeight: 600, color: '#E65100',
    padding: '3px 8px', borderRadius: 4, background: 'rgba(255,152,0,0.15)',
  },
  decisionOptions: {
    padding: '8px 12px', background: '#fff8e1', borderTop: '2px solid #FFB300',
  },
  decisionPrompt: {
    fontSize: 12, color: '#795548', lineHeight: 1.5, marginBottom: 8,
  },
  optionRow: {
    display: 'flex', flexWrap: 'wrap', gap: 6,
  },
  optionBtn: {
    padding: '6px 14px', borderRadius: 16, border: '1px solid #FFB300',
    background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600,
    color: '#E65100', whiteSpace: 'nowrap',
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: 12,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  empty: {
    color: '#999', fontSize: 13, textAlign: 'center',
    padding: 40, fontStyle: 'italic',
  },
  message: {
    padding: '8px 12px', borderRadius: 8,
    borderLeft: '3px solid',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  msgHeader: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  typeIcon: { fontSize: 12 },
  roleLabel: { fontSize: 12, fontWeight: 600 },
  msgTime: { fontSize: 10, color: '#bbb' },
  msgContent: { fontSize: 13, color: '#444', lineHeight: 1.5, whiteSpace: 'pre-wrap' },
  inputArea: {
    padding: 10, borderTop: '1px solid #e0e0e0',
    display: 'flex', gap: 8, background: 'white',
  },
  input: {
    flex: 1, padding: '8px 12px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 13, outline: 'none',
  },
  sendBtn: {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: '#667eea', color: 'white', fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
  },
  runningBanner: {
    padding: '12px 16px', borderTop: '1px solid #e0e0e0',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: '#f5f5f5', fontSize: 13, color: '#666',
  },
  runningDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#4CAF50',
    animation: 'pulse 1.5s ease-in-out infinite',
    display: 'inline-block',
  },
};
