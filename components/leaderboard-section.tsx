'use client'

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts'
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
    label: { color: 'hsl(0 0% 100%)' },
    ...chartData.reduce<Record<string, { label: string; color: string }>>((acc, item) => {
      acc[item.modelKey] = { label: item.model, color: item.fill }
      acc[item.model] = { label: tickFormatter(item.model), color: item.fill }
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
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData} margin={{ bottom: 32 }}>
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
                <LabelList
                  dataKey="model"
                  position="bottom"
                  offset={8}
                  formatter={(value: string) => tickFormatter(value)}
                  className="fill-muted-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
