import { useState, useCallback } from 'react'
import { askClaude } from '../../utils/claude'
import { FilterResult } from './types'

interface UseAIFilterOptions {
  apiKey?: string
  proxyUrl?: string
  language?: string
}

export function useAIFilter({ apiKey, proxyUrl, language }: UseAIFilterOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)

  const filterData = useCallback(
    async (
      query: string,
      data: Record<string, unknown>[]
    ): Promise<number[]> => {
      if (!query.trim()) return data.map((_, i) => i)

      setLoading(true)
      setError(null)
      setExplanation(null)

      try {
        const prompt = `
You are a data filtering assistant.

User query: "${query}"

Data (JSON array):
${JSON.stringify(data, null, 2)}

Task: Based on the user query, return the indices (0-based) of matching rows.

Respond ONLY in this exact JSON format, nothing else:
{
  "indices": [0, 1, 2],
  "explanation": "Showing X rows where ..."
}

Rules:
- indices must be an array of numbers
- If no rows match, return empty array: []
- If query is unclear or matches all, return all indices
- explanation should be short, max 10 words
- Understand natural language: "last week", "above 5000", "pending", "overdue" etc.
- Understand dates, numbers, status values, and text matching
        `.trim()

        const raw = await askClaude({ prompt, apiKey, proxyUrl, language })
        const cleaned = raw.replace(/```json|```/g, '').trim()
        const result: FilterResult = JSON.parse(cleaned)

        setExplanation(result.explanation)
        return result.indices
      } catch {
        setError('Could not process query. Try rephrasing.')
        return data.map((_, i) => i)
      } finally {
        setLoading(false)
      }
    },
    [apiKey, proxyUrl, language]
  )

  return { filterData, loading, error, explanation }
}