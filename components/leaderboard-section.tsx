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

const MAX_LABEL_CHARS = 16

export function LeaderboardChart({ title, description, entries }: LeaderboardChartProps) {
  const chartData = entries.map((entry, index) => ({
    modelKey: `model-${entry.modelId}`,
    model: entry.modelName,
    provider: entry.provider,
    votes: entry.votes,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))

  const tickFormatter = (value: string) =>
    value.length > MAX_LABEL_CHARS ? value.slice(0, MAX_LABEL_CHARS - 1) + '\u2026' : value

  const chartConfig: ChartConfig = {
    votes: { label: 'Picks' },
    ...chartData.reduce<Record<string, { label: string; color: string }>>((acc, item) => {
      acc[item.modelKey] = { label: item.model, color: item.fill }
      acc[item.model] = { label: tickFormatter(item.model), color: item.fill }
      return acc
    }, {}),
  }

  const longestModelNameLength = chartData.reduce(
    (max, item) => Math.max(max, item.model.length),
    0
  )
  const yAxisWidth = Math.min(120, Math.max(80, longestModelNameLength * 6 + 12))

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
          <>
            <div className="hidden sm:block">
              <ChartContainer config={chartConfig} className="h-[200px] min-h-[200px] w-full">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 0 }}
                >
                  <YAxis
                    type="category"
                    dataKey="model"
                    width={yAxisWidth}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) =>
                      chartConfig[value as keyof typeof chartConfig]?.label ?? value
                    }
                    className="text-xs"
                  />
                  <XAxis dataKey="votes" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.model}
                      />
                    }
                  />
                  <Bar dataKey="votes" layout="vertical" radius={5}>
                    {chartData.map((item) => (
                      <Cell key={item.modelKey} fill={item.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>

            <ol className="space-y-1 sm:hidden" aria-label={`${title} ranked list`}>
              {chartData.map((item, index) => (
                <li
                  key={item.modelKey}
                  className="border-border/60 bg-background/40 flex items-center justify-between gap-3 border px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="font-pixel text-muted-foreground w-5 shrink-0 text-[10px] tabular-nums"
                      aria-label={`Rank ${index + 1}`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                      aria-hidden
                    />
                    <span className="text-foreground min-w-0 truncate text-sm">{item.model}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {item.votes} {item.votes === 1 ? 'pick' : 'picks'}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </CardContent>
    </Card>
  )
}
