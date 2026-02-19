import type { LeaderboardData } from '@/server/data/leaderboard'
import { LeaderboardChart } from '@/components/leaderboard-section'

export function CommunityLeaderboardSection({ leaderboard }: { leaderboard: LeaderboardData }) {
  return (
    <section
      id="leaderboard"
      className="border-border/80 bg-card/70 relative scroll-mt-24 overflow-hidden border p-4 shadow-sm backdrop-blur-sm sm:p-6"
    >
      <div className="mb-5 space-y-1.5 sm:mb-6">
        <p className="font-pixel text-muted-foreground text-[10px] tracking-[0.2em] uppercase sm:text-xs">
          Community leaderboard
        </p>
        <h2 className="text-foreground text-2xl font-semibold text-balance sm:text-3xl">
          Top model picks by category
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          See which models are currently most selected across every profile.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
        <LeaderboardChart
          title="Overall"
          description="Popularity across all profile categories."
          entries={leaderboard.overall}
        />
        <LeaderboardChart
          title="Plan"
          description="Models selected specifically for planning work."
          entries={leaderboard.bySlot.plan}
        />
        <LeaderboardChart
          title="Build"
          description="Models chosen for coding and implementation."
          entries={leaderboard.bySlot.build}
        />
        <LeaderboardChart
          title="Debug"
          description="Models favored for troubleshooting and fixes."
          entries={leaderboard.bySlot.debug}
        />
      </div>
    </section>
  )
}
