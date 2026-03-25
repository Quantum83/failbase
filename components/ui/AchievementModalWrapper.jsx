"use client";
import AchievementModal from "./AchievementModal";

export default function AchievementModalWrapper({ achievements, profileId }) {
  return <AchievementModal achievements={achievements} profileId={profileId} />;
}
