'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { getProviderBrand } from '@/lib/provider-brand'
import type { LeaderboardEntry } from '@/server/data/leaderboard'

type LeaderboardSectionProps = {
  tabs: Array<{
    key: string
    label: string
    title: string
    description: string
    entries: LeaderboardEntry[]
  }>
}

function truncateLabel(label: string, maxLength = 22) {
  if (label.length <= maxLength) return label
  return `${label.slice(0, maxLength - 1)}…`
}

export function LeaderboardSection({ tabs }: LeaderboardSectionProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? '')
  const selectedTab = useMemo(
    () => tabs.find((tab) => tab.key === activeTab) ?? tabs[0],
    [activeTab, tabs]
  )
  const activeTabIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.key === selectedTab?.key)
  )
  const activeEntries = selectedTab?.entries ?? []

  const chartData = activeEntries.map((entry) => {
    const brand = getProviderBrand(entry.provider)
    return {
      modelKey: `model-${entry.modelId}`,
      model: entry.modelName,
      provider: entry.provider,
      votes: entry.votes,
      fill: brand?.color ?? 'hsl(var(--chart-1))',
      logoPath: brand?.logoPath ?? null,
    }
  })

  const chartConfig = chartData.reduce<ChartConfig>((acc, item) => {
    acc[item.modelKey] = {
      label: item.model,
      color: item.fill,
    }
    return acc
  }, {})

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div
          role="tablist"
          aria-label="Leaderboard category"
          className="border-border/80 bg-background/60 relative grid w-full items-center  border p-1"
          style={{ gridTemplateColumns: `repeat(${Math.max(tabs.length, 1)}, minmax(0, 1fr))` }}
        >
          <span
            aria-hidden
            className="bg-foreground pointer-events-none absolute top-1 bottom-1  shadow-sm transition-transform duration-300 ease-out"
            style={{
              width: `calc((100% - 0.5rem) / ${Math.max(tabs.length, 1)})`,
              transform: `translateX(calc(${activeTabIndex} * 100%))`,
              left: '0.25rem',
            }}
          />
          {tabs.map((tab) => {
            const isActive = tab.key === selectedTab?.key
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`leaderboard-panel-${tab.key}`}
                className={`relative z-10  px-3 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors sm:text-sm ${
                  isActive ? 'text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <CardTitle className="text-lg">{selectedTab?.title}</CardTitle>
        <CardDescription>{selectedTab?.description}</CardDescription>
      </CardHeader>
      <CardContent
        id={`leaderboard-panel-${selectedTab?.key ?? 'overall'}`}
        role="tabpanel"
        className="space-y-6"
      >
        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm">No model selections yet.</p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="min-h-[260px] w-full sm:min-h-[320px]">
              <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 12, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  type="category"
                  dataKey="model"
                  width={120}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={truncateLabel}
                />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.model}
                    />
                  }
                />
                <Bar dataKey="votes" radius={8}>
                  {chartData.map((item) => (
                    <Cell key={item.modelKey} fill={item.fill} />
                  ))}
                  <LabelList
                    dataKey="votes"
                    position="right"
                    className="fill-foreground text-xs font-medium"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>

            <div className="space-y-2">
              {chartData.map((item, index) => (
                <div
                  key={item.modelKey}
                  className="border-border bg-background/60 flex items-center justify-between gap-3  border px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
                    <span className="text-muted-foreground shrink-0 font-mono text-xs">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.logoPath ? (
                      <Image
                        src={item.logoPath}
                        alt={item.provider}
                        width={16}
                        height={16}
                        className="size-4 shrink-0 "
                      />
                    ) : null}
                    <span className="text-foreground min-w-0 truncate font-medium">
                      {item.model}
                    </span>
                    <span className="text-muted-foreground truncate">({item.provider})</span>
                  </div>
                  <span className="text-foreground shrink-0 text-xs font-semibold sm:text-sm">
                    {item.votes} {item.votes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
