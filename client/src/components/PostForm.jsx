import { Send, X } from "lucide-react";
import { useEffect, useState } from "react";

const emptyPost = {
  content: ""
};

export function PostForm({ editingPost, onCancel, onSubmit, isLoading }) {
  const [form, setForm] = useState(emptyPost);

  useEffect(() => {
    setForm(
      editingPost
        ? { content: editingPost.content }
        : emptyPost
    );
  }, [editingPost]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
    if (!editingPost) {
      setForm(emptyPost);
    }
  }

  return (
    <form className="post-form social-composer" onSubmit={submit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">{editingPost ? "Edit post" : "Compose"}</p>
          <h2>{editingPost ? "Update your thought" : "What is happening?"}</h2>
        </div>
        {editingPost && (
          <button className="ghost-icon" type="button" onClick={onCancel} aria-label="Cancel edit">
            <X size={18} />
          </button>
        )}
      </div>

      <label>
        Post
        <textarea
          name="content"
          value={form.content}
          onChange={updateField}
          placeholder="Share a short update..."
          maxLength={280}
          rows={5}
          required
        />
      </label>

      <div className="composer-footer">
        <span className={form.content.length > 250 ? "char-count near-limit" : "char-count"}>
          {form.content.length}/280
        </span>
        <button className="primary-button" type="submit" disabled={isLoading || !form.content.trim()}>
          <Send size={18} />
          {isLoading ? "Posting" : editingPost ? "Save" : "Post"}
        </button>
      </div>
    </form>
  );
}
