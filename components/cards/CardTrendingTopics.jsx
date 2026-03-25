import { theme } from "@/lib/theme";
import { TRENDING_TOPICS, getDateSeeded } from "@/lib/seed-data";

export default function CardTrendingTopics() {
  const todayTopics = getDateSeeded(TRENDING_TOPICS, 6);

  return (
    <div className="card p-4">
      <h3
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: theme.muted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "12px",
        }}
      >
        Trending Stories
      </h3>
      <div className="flex flex-col gap-2.5">
        {todayTopics.map((item) => (
          <div
            key={item.tag}
            className="flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div
                className="font-semibold group-hover:underline transition-colors"
                style={{ fontSize: "13px", color: theme.dark }}
              >
                {item.emoji} {item.tag}
              </div>
              <div style={{ fontSize: "11px", color: theme.muted }}>
                {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
