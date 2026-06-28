import { LogOut, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthPanel } from "./components/AuthPanel.jsx";
import { Brand } from "./components/Brand.jsx";
import { ChatWidget } from "./components/ChatWidget.jsx";
import { PostForm } from "./components/PostForm.jsx";
import { PostList } from "./components/PostList.jsx";
import { ProfileModal } from "./components/ProfileModal.jsx";
import { ProfilePanel } from "./components/ProfilePanel.jsx";
import { SocialListModal } from "./components/SocialListModal.jsx";
import { TrendingPanel } from "./components/TrendingPanel.jsx";
import { UserSearch } from "./components/UserSearch.jsx";
import { api } from "./lib/api.js";

export function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [activeView, setActiveView] = useState("feed");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [socialList, setSocialList] = useState({ title: "", users: [] });
  const [chatTarget, setChatTarget] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  async function loadPosts() {
    const data = await api.listPosts();
    setPosts(data.posts);
  }

  async function loadUsers() {
    const data = await api.listUsers();
    setUsers(data.users);
  }

  useEffect(() => {
    async function boot() {
      try {
        const token = localStorage.getItem("justpost_token");
        if (token) {
          const session = await api.me();
          setUser(session.user);
          await loadUsers();
        }
      } catch {
        localStorage.removeItem("justpost_token");
      } finally {
        setIsBooting(false);
      }
    }

    boot();
  }, []);

  useEffect(() => {
    if (!isBooting) {
      loadPosts().catch((loadError) => setError(loadError.message));
    }
  }, [isBooting]);

  async function handleAuth(mode, form) {
    setIsLoading(true);
    setError("");

    try {
      const payload =
        mode === "register"
          ? form
          : {
              email: form.email,
              password: form.password
            };
      const data = mode === "register" ? await api.register(payload) : await api.login(payload);

      localStorage.setItem("justpost_token", data.token);
      setUser(data.user);
      await loadUsers();
      await loadPosts();
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePostSubmit(form) {
    setIsLoading(true);
    setError("");

    try {
      if (editingPost) {
        await api.updatePost(editingPost._id, form);
        setEditingPost(null);
      } else {
        await api.createPost(form);
      }

      await loadPosts();
    } catch (postError) {
      setError(postError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id) {
    setIsLoading(true);
    setError("");

    try {
      await api.deletePost(id);
      await loadPosts();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProfileSave(form) {
    setIsLoading(true);
    setError("");

    try {
      const data = await api.updateProfile(form);
      setUser(data.user);
      await loadUsers();
      await loadPosts();
    } catch (profileError) {
      setError(profileError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLike(id) {
    setError("");

    try {
      const data = await api.toggleLike(id);
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post._id === id ? data.post : post))
      );
    } catch (likeError) {
      setError(likeError.message);
    }
  }

  async function handleRepost(id) {
    setError("");

    try {
      const data = await api.toggleRepost(id);
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post._id === id ? data.post : post))
      );
    } catch (repostError) {
      setError(repostError.message);
    }
  }

  async function handleComment(id, content, parentCommentId = null) {
    setError("");

    try {
      const data = await api.addComment(id, { content, parentCommentId });
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post._id === id ? data.post : post))
      );
    } catch (commentError) {
      setError(commentError.message);
    }
  }

  async function handleFollow(id) {
    setError("");

    try {
      const data = await api.toggleFollow(id);
      setUser(data.user);
      setUsers(data.users);
      setSelectedProfile((currentProfile) => {
        const currentProfileId = currentProfile?.id || currentProfile?._id;
        return currentProfileId === id ? { ...currentProfile, ...data.profile } : currentProfile;
      });
    } catch (followError) {
      setError(followError.message);
    }
  }

  function handleViewProfile(profile) {
    const profileId = profile?.id || profile?._id;
    const fullProfile = users.find((candidate) => candidate.id === profileId);
    setSelectedProfile({ ...profile, ...fullProfile, _id: profileId });
  }

  function handleOpenSocialList(title, listUsers) {
    setSocialList({ title, users: listUsers });
  }

  function handleStartChat(profile) {
    const profileId = profile?.id || profile?._id;
    const fullProfile = users.find((candidate) => candidate.id === profileId) || {
      ...profile,
      id: profileId
    };

    setChatTarget(fullProfile);
    setSelectedProfile(null);
  }

  function logout() {
    localStorage.removeItem("justpost_token");
    setUser(null);
    setEditingPost(null);
  }

  const myPosts = posts.filter(
    (post) =>
      String(post.author?._id) === String(user?.id) ||
      post.reposts?.some((repostUser) => String(repostUser.id || repostUser._id) === String(user?.id))
  );
  const visiblePosts = activeView === "profile" ? myPosts : posts;
  const followers = users.filter((candidate) =>
    (candidate.following || []).map(String).includes(String(user?.id))
  );
  const following = users.filter((candidate) =>
    (user?.following || []).map(String).includes(String(candidate.id))
  );

  if (isBooting) {
    return (
      <div className="loading-screen">
        <div className="brand-mark">JP</div>
        <p>Loading JustPost</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPanel onSubmit={handleAuth} error={error} isLoading={isLoading} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Brand />
        <div className="header-actions">
          <UserSearch currentUser={user} users={users} onViewProfile={handleViewProfile} />
          <button type="button" onClick={loadPosts} aria-label="Refresh posts">
            <RefreshCw size={17} />
            Refresh
          </button>
          <button type="button" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard">
        <aside className="composer-panel">
          <ProfilePanel
            user={user}
            postCount={myPosts.length}
            followers={followers}
            following={following}
            onSave={handleProfileSave}
            isLoading={isLoading}
            onOpenSocialList={handleOpenSocialList}
          />
          {error && <p className="form-error">{error}</p>}
          <PostForm
            editingPost={editingPost}
            onCancel={() => setEditingPost(null)}
            onSubmit={handlePostSubmit}
            isLoading={isLoading}
          />
        </aside>
        <section className="feed-panel">
          <div className="feed-tabs" role="tablist" aria-label="Timeline views">
            <button
              type="button"
              className={activeView === "feed" ? "active" : ""}
              onClick={() => setActiveView("feed")}
            >
              For you
            </button>
            <button
              type="button"
              className={activeView === "profile" ? "active" : ""}
              onClick={() => setActiveView("profile")}
            >
              Your posts
            </button>
          </div>
          <PostList
            currentUser={user}
            posts={visiblePosts}
            onEdit={setEditingPost}
            onDelete={handleDelete}
            onLike={handleLike}
            onRepost={handleRepost}
            onComment={handleComment}
            onViewProfile={handleViewProfile}
          />
        </section>
        <TrendingPanel posts={posts} />
      </main>
      <ChatWidget
        currentUser={user}
        users={users}
        chatTarget={chatTarget}
        onChatTargetConsumed={() => setChatTarget(null)}
      />
      <ProfileModal
        currentUser={user}
        profile={selectedProfile}
        posts={posts}
        users={users}
        onFollow={handleFollow}
        onStartChat={handleStartChat}
        onClose={() => setSelectedProfile(null)}
        onOpenSocialList={handleOpenSocialList}
      />
      <SocialListModal
        title={socialList.title}
        users={socialList.users}
        onClose={() => setSocialList({ title: "", users: [] })}
        onViewProfile={handleViewProfile}
      />
    </div>
  );
}
