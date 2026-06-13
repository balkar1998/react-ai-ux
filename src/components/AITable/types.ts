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
}

export interface FilterResult {
  indices: number[]
  explanation: string
}