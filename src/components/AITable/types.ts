export type AITableMode = 'filter' | 'aggregate' | 'insight'

export interface AITableColumn {
  key: string
  label: string
}

export interface AITableProps {
  data: Record<string, unknown>[]
  columns: AITableColumn[]
  apiKey?: string
  proxyUrl?: string
  language?: string
  className?: string
  pageSize?: number
  modes?: AITableMode[]
}

export interface FilterResult {
  mode: 'filter'
  indices: number[]
  explanation: string
}

export interface AggregateResult {
  mode: 'aggregate'
  answer: string
  explanation: string
}

export interface InsightResult {
  mode: 'insight'
  answer: string
  indices: number[]
}

export type AITableResult = FilterResult | AggregateResult | InsightResult