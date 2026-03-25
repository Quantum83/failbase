import { theme } from "@/lib/theme";
import { DAILY_STATS, STATS_FOOTERS, getDateSeeded } from "@/lib/seed-data";

export default function CardStatsWidget() {
  const todayStats = getDateSeeded(DAILY_STATS, 5, 1);
  const todayFooter = getDateSeeded(STATS_FOOTERS, 1, 3)[0];

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
        Failbase Today
      </h3>
      <div className="flex flex-col gap-2.5">
        {todayStats.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base">{row.emoji}</span>
              <span
                style={{
                  fontSize: "12px",
                  color: theme.muted,
                  lineHeight: 1.3,
                }}
              >
                {row.label}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span
                style={{ fontSize: "12px", fontWeight: 700, color: theme.dark }}
              >
                {row.value}
              </span>
              {row.delta && (
                <span
                  style={{
                    fontSize: "10px",
                    color: theme.red,
                    marginLeft: "3px",
                  }}
                >
                  {row.delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          fontSize: "10px",
          color: theme.muted,
          opacity: 0.6,
          fontStyle: "italic",
          marginTop: "10px",
        }}
      >
        {todayFooter}
      </p>
    </div>
  );
}
