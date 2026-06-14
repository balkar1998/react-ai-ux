import React, { useState, useRef } from 'react'
import { AITableProps, AITableMode } from './types'
import { useAIFilter } from './useAIFilter'

const DEFAULT_MODES: AITableMode[] = ['filter', 'aggregate', 'insight']

export function AITable({
  data,
  columns,
  apiKey,
  proxyUrl,
  language,
  className,
  pageSize = 10,
  modes = DEFAULT_MODES,
}: AITableProps) {
  const [query, setQuery] = useState('')
  const [filteredIndices, setFilteredIndices] = useState<number[]>(
    data.map((_, i) => i)
  )
  const [page, setPage] = useState(1)
  const [aggregateAnswer, setAggregateAnswer] = useState<string | null>(null)
  const [aggregateExplanation, setAggregateExplanation] = useState<string | null>(null)
  const [insightAnswer, setInsightAnswer] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { processQuery, loading, error, getPlaceholder } = useAIFilter({
    apiKey,
    proxyUrl,
    language,
    modes,
  })

  const handleSearch = async () => {
    if (!query.trim()) {
      resetState()
      return
    }

    const result = await processQuery(query, data)
    if (!result) return

    if (result.mode === 'filter') {
      setFilteredIndices(result.indices)
      setAggregateAnswer(null)
      setAggregateExplanation(null)
      setInsightAnswer(null)
      setActiveMode('filter')
      setPage(1)
    }

    if (result.mode === 'aggregate') {
      setAggregateAnswer(result.answer)
      setAggregateExplanation(result.explanation)
      setFilteredIndices(data.map((_, i) => i))
      setInsightAnswer(null)
      setActiveMode('aggregate')
      setPage(1)
    }

    if (result.mode === 'insight') {
      setInsightAnswer(result.answer)
      setFilteredIndices(result.indices)
      setAggregateAnswer(null)
      setAggregateExplanation(null)
      setActiveMode('insight')
      setPage(1)
    }
  }

  const resetState = () => {
    setFilteredIndices(data.map((_, i) => i))
    setAggregateAnswer(null)
    setAggregateExplanation(null)
    setInsightAnswer(null)
    setActiveMode(null)
    setPage(1)
  }

  const handleClear = () => {
    setQuery('')
    resetState()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const totalPages = Math.ceil(filteredIndices.length / pageSize)
  const paginatedIndices = filteredIndices.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const isHighlighted = (rowIndex: number) =>
    activeMode === 'insight' && filteredIndices.includes(rowIndex)

  return (
    <div className={className} style={{ width: '100%', fontFamily: 'sans-serif' }}>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
        {query && (
          <button
            onClick={handleClear}
            style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Aggregate answer card */}
      {aggregateAnswer && (
        <div style={{
          backgroundColor: '#eef2ff',
          border: '1px solid #c7d2fe',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#4f46e5' }}>
            {aggregateAnswer}
          </div>
          <div style={{ fontSize: '13px', color: '#6366f1' }}>
            {aggregateExplanation}
          </div>
        </div>
      )}

      {/* Insight answer card */}
      {insightAnswer && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d', marginBottom: '4px' }}>
            ✦ AI Insight
          </div>
          <div style={{ fontSize: '14px', color: '#166534', lineHeight: 1.6 }}>
            {insightAnswer}
          </div>
        </div>
      )}

      {/* Status bar */}
      <div style={{ minHeight: '24px', marginBottom: '8px', fontSize: '13px' }}>
        {loading && (
          <span style={{ color: '#9ca3af' }}>Analyzing your query...</span>
        )}
        {!loading && error && (
          <span style={{ color: '#dc2626' }}>✗ {error}</span>
        )}
        {!loading && !error && activeMode === 'filter' && (
          <span style={{ color: '#4f46e5' }}>
            ✦ Showing {filteredIndices.length} of {data.length} rows
          </span>
        )}
        {!loading && !error && activeMode === 'insight' && (
          <span style={{ color: '#15803d' }}>
            ✦ {filteredIndices.length} relevant rows highlighted
          </span>
        )}
        {!loading && !error && !activeMode && (
          <span style={{ color: '#9ca3af' }}>
            {data.length} rows total
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedIndices.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}
                >
                  No results found
                </td>
              </tr>
            ) : (
              paginatedIndices.map((rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: isHighlighted(rowIndex) ? '#f0fdf4' : 'transparent',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = isHighlighted(rowIndex) ? '#dcfce7' : '#f9fafb')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = isHighlighted(rowIndex) ? '#f0fdf4' : 'transparent')
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ padding: '10px 14px', color: '#111827' }}
                    >
                      {String(data[rowIndex][col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'transparent',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
              fontSize: '13px',
            }}
          >
            Prev
          </button>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'transparent',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.5 : 1,
              fontSize: '13px',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}