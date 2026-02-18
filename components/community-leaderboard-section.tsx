import type { LeaderboardData } from '@/server/data/leaderboard'
import { LeaderboardSection } from '@/components/leaderboard-section'

export function CommunityLeaderboardSection({ leaderboard }: { leaderboard: LeaderboardData }) {
  return (
    <section
      id="leaderboard"
      className="animate-in fade-in fill-mode-both border-border/80 bg-card/70 relative scroll-mt-24 overflow-hidden  border p-4 shadow-sm backdrop-blur-sm delay-300 duration-500 sm:p-6"
    >
      <div className="mb-5 space-y-1.5 sm:mb-6">
        <p className="font-pixel text-muted-foreground text-[10px] tracking-[0.2em] uppercase sm:text-xs">
          Community leaderboard
        </p>
        <h2 className="text-foreground text-2xl font-semibold text-balance sm:text-3xl">
          Top model picks by slot
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          See which models are currently most selected across every profile.
        </p>
      </div>
      <LeaderboardSection
        tabs={[
          {
            key: 'overall',
            label: 'Overall',
            title: 'Overall Top Models',
            description: 'Popularity across all profile slots.',
            entries: leaderboard.overall,
          },
          {
            key: 'plan',
            label: 'Plan',
            title: 'Top Models for Plan',
            description: 'Models selected specifically for planning work.',
            entries: leaderboard.bySlot.plan,
          },
          {
            key: 'build',
            label: 'Build',
            title: 'Top Models for Build',
            description: 'Models chosen for coding and implementation.',
            entries: leaderboard.bySlot.build,
          },
          {
            key: 'debug',
            label: 'Debug',
            title: 'Top Models for Debug',
            description: 'Models favored for troubleshooting and fixes.',
            entries: leaderboard.bySlot.debug,
          },
        ]}
      />
    </section>
  )
}
