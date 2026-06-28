const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const token = localStorage.getItem("justpost_token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : {};

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  login: (payload) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  register: (payload) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  me: () => request("/api/auth/me"),
  updateProfile: (payload) =>
    request("/api/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  listUsers: () => request("/api/auth/users"),
  toggleFollow: (id) =>
    request(`/api/auth/users/${id}/follow`, {
      method: "PATCH"
    }),
  listPosts: () => request("/api/posts"),
  createPost: (payload) =>
    request("/api/posts", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updatePost: (id, payload) =>
    request(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  toggleLike: (id) =>
    request(`/api/posts/${id}/like`, {
      method: "PATCH"
    }),
  toggleRepost: (id) =>
    request(`/api/posts/${id}/repost`, {
      method: "PATCH"
    }),
  addComment: (id, payload) =>
    request(`/api/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  listConversations: () => request("/api/messages/conversations"),
  listMessages: (userId) => request(`/api/messages/${userId}`),
  listUnreadMessages: () => request("/api/messages/unread/counts"),
  sendMessage: (userId, payload) =>
    request(`/api/messages/${userId}`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  deletePost: (id) =>
    request(`/api/posts/${id}`, {
      method: "DELETE"
    })
};
