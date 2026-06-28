import { Check, Edit3, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProfilePanel({
  user,
  postCount,
  followers,
  following,
  onSave,
  isLoading,
  onOpenSocialList
}) {
  const [isEditing, setIsEditing] = useState(false);
  const avatarInputRef = useRef(null);
  const headerInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    avatarUrl: "",
    headerUrl: ""
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      username: user?.username || user?.email?.split("@")[0] || "",
      bio: user?.bio || "",
      location: user?.location || "",
      avatarUrl: user?.avatarUrl || "",
      headerUrl: user?.headerUrl || ""
    });
  }, [user]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function submit(event) {
    event.preventDefault();
    await onSave(form);
    setIsEditing(false);
  }

  async function updateImage(event, fieldName) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageData = await readImageFile(file);
    setForm((current) => ({
      ...current,
      [fieldName]: imageData
    }));
  }

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="profile-panel" aria-label="Profile">
      <div
        className="profile-cover"
        style={(isEditing ? form.headerUrl : user.headerUrl) ? { backgroundImage: `url(${isEditing ? form.headerUrl : user.headerUrl})` } : undefined}
      />
      <div className="profile-content">
        <div className="profile-topline">
          <div className="profile-avatar">
            {(isEditing ? form.avatarUrl : user.avatarUrl) ? (
              <img src={isEditing ? form.avatarUrl : user.avatarUrl} alt="" />
            ) : (
              initials || "JP"
            )}
          </div>
          {!isEditing && (
            <button type="button" className="outline-button" onClick={() => setIsEditing(true)}>
              <Edit3 size={16} />
              Edit profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={submit}>
            <label>
              Name
              <input name="name" value={form.name} onChange={updateField} maxLength={80} required />
            </label>
            <label>
              Username
              <input
                name="username"
                value={form.username}
                onChange={updateField}
                maxLength={30}
                required
              />
            </label>
            <label>
              Bio
              <textarea name="bio" value={form.bio} onChange={updateField} maxLength={160} rows={3} />
            </label>
            <label>
              Location
              <input name="location" value={form.location} onChange={updateField} maxLength={60} />
            </label>
            <input
              ref={avatarInputRef}
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={(event) => updateImage(event, "avatarUrl")}
            />
            <input
              ref={headerInputRef}
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={(event) => updateImage(event, "headerUrl")}
            />
            <div className="image-edit-actions">
              <button type="button" className="outline-button" onClick={() => avatarInputRef.current?.click()}>
                <Edit3 size={16} />
                Edit display picture
              </button>
              <button type="button" className="outline-button" onClick={() => headerInputRef.current?.click()}>
                <Edit3 size={16} />
                Edit header
              </button>
            </div>
            <div className="profile-form-actions">
              <button type="button" className="outline-button" onClick={() => setIsEditing(false)}>
                <X size={16} />
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={isLoading}>
                <Check size={16} />
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-summary">
            <h2>{user.name}</h2>
            <p className="profile-handle">@{user.username || user.email.split("@")[0]}</p>
            <p>{user.bio || "No bio yet."}</p>
            {user.location && (
              <p className="profile-location">
                <MapPin size={15} />
                {user.location}
              </p>
            )}
            <div className="profile-stats">
              <span>
                <strong>{postCount}</strong> posts
              </span>
              <span>
                <button type="button" onClick={() => onOpenSocialList("Following", following)}>
                  <strong>{following.length}</strong> following
                </button>
              </span>
              <span>
                <button type="button" onClick={() => onOpenSocialList("Followers", followers)}>
                  <strong>{followers.length}</strong> followers
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
