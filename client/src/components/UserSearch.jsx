import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export function UserSearch({ currentUser, users, onViewProfile }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const safeUsers = Array.isArray(users) ? users : [];

    if (!normalizedQuery) {
      return [];
    }

    return safeUsers
      .filter((user) => user.id !== currentUser?.id)
      .filter((user) => {
        const username = user.username || user.email.split("@")[0];
        return (
          user.name.toLowerCase().includes(normalizedQuery) ||
          username.toLowerCase().includes(normalizedQuery) ||
          user.email.toLowerCase().includes(normalizedQuery)
        );
      })
      .slice(0, 8);
  }, [currentUser?.id, query, users]);

  function openProfile(user) {
    onViewProfile(user);
    setQuery("");
  }

  return (
    <div className="user-search">
      <Search size={17} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search users"
        aria-label="Search users"
      />
      {query && (
        <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">
          <X size={15} />
        </button>
      )}
      {query && (
        <div className="search-results" role="listbox" aria-label="User search results">
          {results.map((user) => (
            <button type="button" key={user.id} onClick={() => openProfile(user)} role="option">
              <span className="search-result-name">{user.name}</span>
              <span>@{user.username || user.email.split("@")[0]}</span>
            </button>
          ))}
          {!results.length && <p>No users found.</p>}
        </div>
      )}
    </div>
  );
}
