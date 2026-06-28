import { X } from "lucide-react";

export function SocialListModal({ title, users, onClose, onViewProfile }) {
  if (!title) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="social-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="social-modal-header">
          <h2>{title}</h2>
          <button className="ghost-icon" type="button" onClick={onClose} aria-label={`Close ${title}`}>
            <X size={18} />
          </button>
        </div>
        <div className="social-list floating-social-list">
          {users.map((user) => (
            <button
              type="button"
              className="social-list-item user-list-item"
              key={user.id}
              onClick={() => {
                onViewProfile(user);
                onClose();
              }}
            >
              <span className="user-list-name">{user.name}</span>
              <span>@{user.username || user.email.split("@")[0]}</span>
            </button>
          ))}
          {!users.length && <p className="social-list-empty">Nothing to show yet.</p>}
        </div>
      </section>
    </div>
  );
}
