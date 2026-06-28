import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

function getInitials(name) {
  return name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getUserId(user) {
  return user?.id || user?._id;
}

export function ChatWidget({ currentUser, users, chatTarget, onChatTargetConsumed }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [conversationUsers, setConversationUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [unreadTotal, setUnreadTotal] = useState(0);

  const chatUsers = useMemo(
    () => {
      const chatUsersById = new Map();

      conversationUsers.forEach((user) => {
        chatUsersById.set(getUserId(user), user);
      });

      if (activeUser) {
        chatUsersById.set(getUserId(activeUser), activeUser);
      }

      return [...chatUsersById.values()].filter((user) => getUserId(user) !== currentUser?.id);
    },
    [activeUser, conversationUsers, currentUser?.id]
  );

  async function loadConversationUsers() {
    try {
      const data = await api.listConversations();
      setConversationUsers(data.users);
    } catch {
      setConversationUsers([]);
    }
  }

  useEffect(() => {
    setIsOpen(false);
    setActiveUser(null);
    setConversationUsers([]);
    setMessages([]);
    setDraft("");
    setError("");
  }, [currentUser?.id]);

  async function loadUnreadCounts() {
    try {
      const data = await api.listUnreadMessages();
      setUnreadCounts(data.counts);
      setUnreadTotal(data.total);
    } catch {
      setUnreadCounts({});
      setUnreadTotal(0);
    }
  }

  useEffect(() => {
    loadUnreadCounts();
    loadConversationUsers();
    const intervalId = window.setInterval(loadUnreadCounts, 15000);

    return () => window.clearInterval(intervalId);
  }, [currentUser?.id]);

  useEffect(() => {
    if (!chatTarget) {
      return;
    }

    const targetId = getUserId(chatTarget);
    const fullTarget = users.find((user) => user.id === targetId) || {
      ...chatTarget,
      id: targetId
    };

    setActiveUser(fullTarget);
    setIsOpen(true);
    onChatTargetConsumed();
  }, [chatTarget, onChatTargetConsumed, users]);

  useEffect(() => {
    async function loadConversation() {
      if (!activeUser) {
        setMessages([]);
        return;
      }

      try {
        setError("");
        const data = await api.listMessages(getUserId(activeUser));
        setMessages(data.messages);
        await loadUnreadCounts();
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadConversation();
  }, [activeUser]);

  async function submitMessage(event) {
    event.preventDefault();

    if (!activeUser || !draft.trim()) {
      return;
    }

    try {
      setError("");
      const data = await api.sendMessage(getUserId(activeUser), { content: draft });
      setMessages((currentMessages) => [...currentMessages, data.message]);
      setDraft("");
      await loadConversationUsers();
      await loadUnreadCounts();
    } catch (sendError) {
      setError(sendError.message);
    }
  }

  return (
    <div className="chat-widget">
      {isOpen && (
        <section className="chat-panel" aria-label="Messages">
          <div className="chat-header">
            <div>
              <h2>Messages</h2>
              <p>{activeUser ? `Chatting with ${activeUser.name}` : "Choose a user"}</p>
            </div>
            <button type="button" className="ghost-icon" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          <div className="chat-body">
            <aside className="chat-users" aria-label="Chat users">
              {chatUsers.map((user) => (
                <button
                  type="button"
                  className={getUserId(activeUser) === getUserId(user) ? "active" : ""}
                  key={getUserId(user)}
                  onClick={() => setActiveUser(user)}
                >
                  <span className="chat-avatar">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : getInitials(user.name) || "JP"}
                  </span>
                  <span>{user.name}</span>
                  {!!unreadCounts[getUserId(user)] && (
                    <span className="unread-badge">{unreadCounts[getUserId(user)]}</span>
                  )}
                </button>
              ))}
              {!chatUsers.length && <p>No users yet.</p>}
            </aside>

            <div className="conversation">
              {error && <p className="chat-error">{error}</p>}
              {activeUser ? (
                <>
                  <div className="message-list">
                    {messages.map((message) => {
                      const isMine = message.sender?._id === currentUser?.id;

                      return (
                        <div className={isMine ? "message mine" : "message"} key={message._id}>
                          <p>{message.content}</p>
                        </div>
                      );
                    })}
                    {!messages.length && <p className="conversation-empty">Start the conversation.</p>}
                  </div>
                  <form className="message-form" onSubmit={submitMessage}>
                    <input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Write a message"
                      maxLength={500}
                    />
                    <button type="submit" className="primary-button" disabled={!draft.trim()}>
                      <Send size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="conversation-empty">Select someone to chat with.</div>
              )}
            </div>
          </div>
        </section>
      )}

      <button type="button" className="chat-toggle" onClick={() => setIsOpen((current) => !current)}>
        <MessageCircle size={20} />
        Chat
        {!!unreadTotal && <span className="chat-toggle-badge">{unreadTotal}</span>}
      </button>
    </div>
  );
}
