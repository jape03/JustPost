import { MapPin, MessageCircle, X } from "lucide-react";

function getUserId(user) {
  return user?.id || user?._id;
}

export function ProfileModal({
  currentUser,
  profile,
  posts,
  users,
  onClose,
  onFollow,
  onStartChat,
  onOpenSocialList
}) {
  if (!profile) {
    return null;
  }

  const profileId = getUserId(profile);
  const currentUserId = getUserId(currentUser);
  const followingIds = (profile.following || []).map(String);
  const followers = users.filter((user) => (user.following || []).map(String).includes(String(profileId)));
  const following = users.filter((user) => followingIds.includes(String(getUserId(user))));
  const profilePosts = posts.filter(
    (post) =>
      String(post.author?._id) === String(profileId) ||
      post.reposts?.some((repostUser) => String(repostUser.id || repostUser._id) === String(profileId))
  );
  const isOwnProfile = profileId === currentUserId;
  const isFollowing = (currentUser?.following || []).map(String).includes(String(profileId));
  const initials = profile.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="profile-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="ghost-icon modal-close" type="button" onClick={onClose} aria-label="Close profile">
          <X size={18} />
        </button>
        <div
          className="profile-cover"
          style={profile.headerUrl ? { backgroundImage: `url(${profile.headerUrl})` } : undefined}
        />
        <div className="profile-content">
          <div className="profile-topline">
            <div className="profile-avatar">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : initials || "JP"}
            </div>
            {!isOwnProfile && (
              <div className="profile-action-row">
                <button type="button" className="outline-button" onClick={() => onStartChat(profile)}>
                  <MessageCircle size={16} />
                  Chat
                </button>
                <button type="button" className="primary-button follow-button" onClick={() => onFollow(profileId)}>
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            )}
          </div>
          <div className="profile-summary">
            <h2>{profile.name}</h2>
            <p className="profile-handle">@{profile.username || profile.email?.split("@")[0]}</p>
            <p>{profile.bio || "No bio yet."}</p>
            {profile.location && (
              <p className="profile-location">
                <MapPin size={15} />
                {profile.location}
              </p>
            )}
            <div className="profile-stats">
              <button type="button">
                <strong>{profilePosts.length}</strong> posts
              </button>
              <button type="button" onClick={() => onOpenSocialList(`${profile.name}'s following`, following)}>
                <strong>{following.length}</strong> following
              </button>
              <button type="button" onClick={() => onOpenSocialList(`${profile.name}'s followers`, followers)}>
                <strong>{followers.length}</strong> followers
              </button>
            </div>
            <div className="social-list">
              {profilePosts.slice(0, 5).map((post) => (
                <p className="social-list-item" key={post._id}>
                  {post.author?._id !== profileId && "Reposted: "}
                  {post.content}
                </p>
              ))}
              {!profilePosts.length && <p className="social-list-empty">No posts yet.</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
