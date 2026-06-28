import { Hash } from "lucide-react";
import { useMemo } from "react";

function getTrends(posts) {
  const trendMap = new Map();

  posts.forEach((post) => {
    const tags = post.content.match(/#[a-z0-9_]+/gi) || [];

    tags.forEach((tag) => {
      const normalizedTag = tag.toLowerCase();
      trendMap.set(normalizedTag, (trendMap.get(normalizedTag) || 0) + 1);
    });
  });

  if (!trendMap.size) {
    return [
      { tag: "#justpost", count: posts.length || 1 },
      { tag: "#social", count: Math.max(posts.length - 1, 1) },
      { tag: "#buildinpublic", count: Math.max(posts.length - 2, 1) }
    ];
  }

  return [...trendMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((firstTrend, secondTrend) => secondTrend.count - firstTrend.count)
    .slice(0, 6);
}

export function TrendingPanel({ posts }) {
  const trends = useMemo(() => getTrends(posts), [posts]);

  return (
    <aside className="trending-panel" aria-label="What's trending">
      <div className="trending-heading">
        <Hash size={18} />
        <h2>What&apos;s Trending</h2>
      </div>
      <div className="trend-list">
        {trends.map((trend, index) => (
          <article className="trend-item" key={trend.tag}>
            <span>Trending #{index + 1}</span>
            <h3>{trend.tag}</h3>
            <p>{trend.count} posts</p>
          </article>
        ))}
      </div>
    </aside>
  );
}
