"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ChatsCircle, Plus, PaperPlaneTilt } from "@phosphor-icons/react";

interface Conversation {
  id: string;
  participants: string[];
  lastMessageAt: string | null;
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { barSlug } = useParams<{ barSlug: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/bar/${barSlug}/messages`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  useEffect(() => {
    if (barSlug) fetchConversations();
  }, [barSlug]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
    }
  }, [activeConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/bar/${barSlug}/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const handleNewConversation = async () => {
    const content = prompt("Enter your first message to start a conversation:");
    if (!content || !content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bar/${barSlug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        const conv = await res.json();
        setConversations(prev => [conv, ...prev]);
        setActiveConv(conv);
      }
    } catch (err) {
      console.error("Failed to create conversation", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    const content = input.trim();
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`/api/bar/${barSlug}/messages/${activeConv.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px", height: "calc(100dvh - 80px)", maxWidth: "1000px" }}>
      {/* Conversation list */}
      <div style={{
        width: "280px", flexShrink: 0, background: "var(--color-card, #1a1a1a)",
        border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "16px", borderBottom: "1px solid var(--color-card-border, #262626)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px", margin: 0 }}>Conversations</h2>
          <button onClick={handleNewConversation} disabled={loading} style={{
            background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px",
            padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
            fontSize: "12px", fontWeight: 600, opacity: loading ? 0.6 : 1,
          }}>
            <Plus size={14} /> New
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <ChatsCircle size={32} color="var(--color-text-muted, #737373)" />
              <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", marginTop: "8px" }}>No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                style={{
                  padding: "12px 16px", cursor: "pointer",
                  borderBottom: "1px solid var(--color-card-border, #262626)",
                  background: activeConv?.id === conv.id ? "rgba(124,58,237,0.1)" : "transparent",
                  borderLeft: activeConv?.id === conv.id ? "3px solid #7c3aed" : "3px solid transparent",
                }}
              >
                <div style={{ color: "var(--color-text-primary, #fff)", fontSize: "13px", fontWeight: 600 }}>
                  {conv.participants?.join(", ") || "Conversation"}
                </div>
                <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", marginTop: "2px" }}>
                  {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : new Date(conv.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div style={{
        flex: 1, background: "var(--color-card, #1a1a1a)",
        border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {activeConv ? (
          <>
            <div style={{ padding: "16px", borderBottom: "1px solid var(--color-card-border, #262626)" }}>
              <h2 style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px", margin: 0 }}>
                {activeConv.participants?.join(", ") || "Conversation"}
              </h2>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: msg.senderId === "bar" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth: "75%", padding: "10px 14px", borderRadius: "12px",
                    background: msg.senderId === "bar" ? "#7c3aed" : "var(--color-bg, #0a0a0a)",
                    border: msg.senderId === "bar" ? "none" : "1px solid var(--color-card-border, #262626)",
                    color: msg.senderId === "bar" ? "#fff" : "var(--color-text-primary, #fff)",
                    fontSize: "13px", lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--color-text-muted, #737373)", marginTop: "4px" }}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-card-border, #262626)", display: "flex", gap: "8px" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: "10px",
                  background: "var(--color-input-bg, #0a0a0a)",
                  border: "1px solid var(--color-input-border, #262626)",
                  color: "var(--color-text-primary, #fff)", fontSize: "13px", outline: "none",
                }}
              />
              <button onClick={handleSend} disabled={loading || !input.trim()} style={{
                padding: "10px 16px", background: "#7c3aed", color: "#fff",
                border: "none", borderRadius: "10px", cursor: "pointer",
                fontWeight: 600, fontSize: "13px", opacity: loading || !input.trim() ? 0.6 : 1,
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                <PaperPlaneTilt size={16} /> Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <ChatsCircle size={48} color="var(--color-text-muted, #737373)" />
            <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px" }}>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
