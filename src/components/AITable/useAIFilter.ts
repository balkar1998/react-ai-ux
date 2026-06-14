import { useState, useCallback } from 'react'
import { askClaude } from '../../utils/claude'
import { AITableMode, AITableResult } from './types'

interface UseAIFilterOptions {
  apiKey?: string
  proxyUrl?: string
  language?: string
  modes: AITableMode[]
}

export function useAIFilter({ apiKey, proxyUrl, language, modes }: UseAIFilterOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AITableResult | null>(null)

  const getPlaceholder = (): string => {
    if (modes.length === 1) {
      if (modes[0] === 'filter') return 'Try "show pending orders" or "cancelled status"...'
      if (modes[0] === 'aggregate') return 'Try "total amount this week" or "who placed the highest order"...'
      if (modes[0] === 'insight') return 'Try "which customers are at risk?" or "any trends?"...'
    }
    if (modes.includes('filter') && modes.includes('aggregate') && !modes.includes('insight')) {
      return 'Try "show pending orders" or "total amount above 5000"...'
    }
    return 'Ask anything — filter, calculate, or analyze your data...'
  }

  const processQuery = useCallback(
    async (
      query: string,
      data: Record<string, unknown>[]
    ): Promise<AITableResult | null> => {
      if (!query.trim()) return null

      setLoading(true)
      setError(null)
      setResult(null)

      try {
        const modeInstructions = modes.map((m) => {
          if (m === 'filter') return `- "filter": use when user wants to see specific rows. Respond with: { "mode": "filter", "indices": [0,1,2], "explanation": "short explanation max 10 words" }`
          if (m === 'aggregate') return `- "aggregate": use when user wants a calculated answer like total, count, average, max, min. Respond with: { "mode": "aggregate", "answer": "the computed value", "explanation": "short explanation max 10 words" }`
          if (m === 'insight') return `- "insight": use when user wants analysis, trends, or reasoning about the data. Respond with: { "mode": "insight", "answer": "your detailed analysis", "indices": [relevant row indices] }`
        }).join('\n')

        const prompt = `
You are a data analysis assistant.

User query: "${query}"

Available modes:
${modeInstructions}

Data (JSON array):
${JSON.stringify(data, null, 2)}

Task:
1. Decide which mode best fits the user query from available modes only
2. Respond ONLY in the exact JSON format for that mode, nothing else
3. No markdown, no backticks, just raw JSON

Rules:
- Understand natural language: "last week", "above 5000", "pending", "overdue", "highest", "total", "average"
- For dates use the data values as reference
- For aggregate, compute the actual value from the data
- For insight, be specific and reference actual data points
- indices must always be valid 0-based array positions
        `.trim()

        const raw = await askClaude({ prompt, apiKey, proxyUrl, language })
        const cleaned = raw.replace(/```json|```/g, '').trim()
        const parsed: AITableResult = JSON.parse(cleaned)

        setResult(parsed)
        return parsed
      } catch {
        setError('Could not process query. Try rephrasing.')
        return null
      } finally {
        setLoading(false)
      }
    },
    [apiKey, proxyUrl, language, modes]
  )

  return { processQuery, loading, error, result, getPlaceholder }
}