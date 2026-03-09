import type { LeaderboardData } from '@/server/data/leaderboard'
import {
  PROFILE_SLOT_CONFIG,
  PROFILE_SLOT_LEADERBOARD_DESCRIPTIONS,
} from '@/lib/profile-slots'
import { EditorLeaderboardChart, LeaderboardChart } from '@/components/leaderboard-section'

export function CommunityLeaderboardSection({ leaderboard }: { leaderboard: LeaderboardData }) {
  return (
    <section
      id="leaderboard"
      className="border-border/80 bg-card/70 relative scroll-mt-24 overflow-hidden border p-4 shadow-sm backdrop-blur-sm sm:p-6"
    >
      <div className="mb-5 space-y-1.5 sm:mb-6">
        <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase sm:text-xs">
          Community leaderboard
        </p>
        <h2 className="text-foreground text-2xl font-semibold text-balance sm:text-3xl">
          Top model picks by category
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          See which models are currently most selected across every profile.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <EditorLeaderboardChart
          title="Main editor"
          description="Most popular editors across the community."
          entries={leaderboard.byMainEditor}
        />
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <LeaderboardChart
            title="Overall"
            description="Popularity across all profile categories."
            entries={leaderboard.overall}
          />
        {PROFILE_SLOT_CONFIG.map((slot) => (
          <LeaderboardChart
            key={slot.id}
            title={slot.label}
            description={PROFILE_SLOT_LEADERBOARD_DESCRIPTIONS[slot.id]}
            entries={leaderboard.bySlot[slot.id]}
          />
        ))}
        </div>
      </div>
    </section>
  )
}
