import Link from "next/link";
import { theme } from "@/lib/theme";
import { getAvatarUrl } from "@/lib/seed-data";

export default function CardSearchPerson({ profile, stats }) {
  const avatarUrl =
    profile.avatar_url || getAvatarUrl(profile.avatar_seed || "default");

  return (
    <Link href={`/profile/${profile.username}`} className="block">
      <div
        className="card p-4 transition-all hover:shadow-md"
        style={{ cursor: "pointer" }}
      >
        {/* Avatar + name row — CSS Grid for blowout safety */}
        <div
          className="grid items-center gap-3 w-full"
          style={{ gridTemplateColumns: "48px 1fr" }}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img
              src={avatarUrl}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div
              className="truncate"
              style={{ fontSize: "15px", fontWeight: 700, color: theme.dark }}
            >
              {profile.display_name}
            </div>
            {profile.location && (
              <div
                className="truncate"
                style={{ fontSize: "12px", color: theme.muted }}
              >
                📍 {profile.location}
              </div>
            )}
            {profile.title && (
              <div
                className="truncate"
                style={{
                  fontSize: "13px",
                  color: theme.dark,
                  marginTop: "2px",
                }}
              >
                {profile.title}
              </div>
            )}
          </div>
        </div>

        {/* About snippet */}
        {profile.about && (
          <div
            style={{
              fontSize: "13px",
              color: theme.muted,
              marginTop: "10px",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
          >
            {profile.about}
          </div>
        )}

        {/* Stats row */}
        <div
          className="flex items-center gap-3 flex-wrap"
          style={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: `1px solid ${theme.border}`,
            fontSize: "12px",
            color: theme.muted,
          }}
        >
          <span>
            📝 {stats.postCount} {stats.postCount === 1 ? "post" : "posts"}
          </span>
          {stats.achievementCount > 0 && (
            <span>
              🏆 {stats.achievementCount}{" "}
              {stats.achievementCount === 1 ? "achievement" : "achievements"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
