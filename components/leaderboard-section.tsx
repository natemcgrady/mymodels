'use client'

import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { LeaderboardEntry } from '@/server/data/leaderboard'

type LeaderboardChartProps = {
  title: string
  description: string
  entries: LeaderboardEntry[]
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const MAX_CHART_ITEMS = 5

export function LeaderboardChart({ title, description, entries }: LeaderboardChartProps) {
  const chartData = entries.slice(0, MAX_CHART_ITEMS).map((entry, index) => ({
    modelKey: `model-${entry.modelId}`,
    model: entry.modelName,
    provider: entry.provider,
    votes: entry.votes,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))

  const chartConfig: ChartConfig = {
    votes: { label: 'Picks' },
    label: { color: 'hsl(0 0% 100%)' },
    ...chartData.reduce<Record<string, { label: string; color: string }>>((acc, item) => {
      acc[item.modelKey] = { label: item.model, color: item.fill }
      return acc
    }, {}),
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm">No model selections yet.</p>
        ) : (
          <div className="space-y-3">
            <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
              <BarChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: 8 }}>
                <XAxis dataKey="model" hide />
                <YAxis dataKey="votes" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.model}
                    />
                  }
                />
                <Bar dataKey="votes" fill="var(--chart-1)" radius={8}>
                  {chartData.map((item) => (
                    <Cell key={item.modelKey} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <ul
              className="text-muted-foreground grid gap-2 text-center text-[11px] leading-tight sm:text-xs"
              style={{ gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))` }}
            >
              {chartData.map((item) => (
                <li key={item.modelKey} className="min-w-0 px-1 wrap-break-word" title={item.model}>
                  {item.model}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
