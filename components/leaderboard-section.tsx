'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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

export function LeaderboardSection({ tabs }: LeaderboardSectionProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') ?? tabs[0]?.key ?? ''

  const setActiveTab = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === tabs[0]?.key) {
      params.delete('tab')
    } else {
      params.set('tab', key)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const selectedTab = useMemo(
    () => tabs.find((tab) => tab.key === activeTab) ?? tabs[0],
    [activeTab, tabs]
  )
  const activeTabIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.key === selectedTab?.key)
  )
  const activeEntries = selectedTab?.entries ?? []

  const chartColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ]
  const chartData = activeEntries.map((entry, index) => {
    const brand = getProviderBrand(entry.provider)
    return {
      modelKey: `model-${entry.modelId}`,
      model: entry.modelName,
      provider: entry.provider,
      votes: entry.votes,
      fill: chartColors[index % chartColors.length],
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
  const longestModelNameLength = chartData.reduce(
    (maxLength, item) => Math.max(maxLength, item.model.length),
    0
  )
  const MAX_LABEL_CHARS = 18
  const yAxisWidth = Math.min(128, Math.max(88, longestModelNameLength * 6 + 14))
  const tickFormatter = (value: string) =>
    value.length > MAX_LABEL_CHARS ? value.slice(0, MAX_LABEL_CHARS - 1) + '\u2026' : value

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="px-2 sm:px-6">
        <div
          role="tablist"
          aria-label="Leaderboard category"
          className="border-border/80 bg-background/60 relative grid w-full items-center border p-1"
          style={{ gridTemplateColumns: `repeat(${Math.max(tabs.length, 1)}, minmax(0, 1fr))` }}
        >
          <span
            aria-hidden
            className="bg-foreground pointer-events-none absolute top-1 bottom-1 shadow-sm transition-transform duration-300 ease-out"
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
                className={`relative z-10 px-3 py-3 text-xs font-semibold tracking-[0.12em] uppercase transition-colors sm:text-sm ${
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
        className="space-y-4 px-2 sm:space-y-6 sm:px-6"
      >
        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm">No model selections yet.</p>
        ) : (
          <>
            <div className="hidden sm:block">
              <ChartContainer
                config={chartConfig}
                className="h-[280px] min-h-[280px] w-full lg:h-[320px] lg:min-h-[320px]"
              >
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
                    width={yAxisWidth}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={tickFormatter}
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
                  <Bar dataKey="votes" radius={0}>
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
            </div>

            <ol className="space-y-1 sm:hidden" aria-label="Ranked model list">
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
