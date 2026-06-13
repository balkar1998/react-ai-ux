import React, { useState, useRef } from 'react'
import { AITableProps } from './types'
import { useAIFilter } from './useAIFilter'

export function AITable({
  data,
  columns,
  apiKey,
  proxyUrl,
  language,
  className,
  pageSize = 10,
}: AITableProps) {
  const [query, setQuery] = useState('')
  const [filteredIndices, setFilteredIndices] = useState<number[]>(
    data.map((_, i) => i)
  )
  const [page, setPage] = useState(1)
  const inputRef = useRef<HTMLInputElement>(null)

  const { filterData, loading, error, explanation } = useAIFilter({
    apiKey,
    proxyUrl,
    language,
  })

  const handleSearch = async () => {
    if (!query.trim()) {
      setFilteredIndices(data.map((_, i) => i))
      return
    }
    const indices = await filterData(query, data)
    setFilteredIndices(indices)
    setPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleClear = () => {
    setQuery('')
    setFilteredIndices(data.map((_, i) => i))
    setPage(1)
    inputRef.current?.focus()
  }

  const totalPages = Math.ceil(filteredIndices.length / pageSize)
  const paginatedIndices = filteredIndices.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

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
          placeholder='Try "show orders above 5000" or "pending status"...'
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
          {loading ? 'Searching...' : 'Search'}
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

      {/* Status bar */}
      <div style={{ minHeight: '24px', marginBottom: '8px', fontSize: '13px' }}>
        {loading && (
          <span style={{ color: '#9ca3af' }}>Analyzing your query...</span>
        )}
        {!loading && explanation && (
          <span style={{ color: '#4f46e5' }}>✦ {explanation}</span>
        )}
        {!loading && error && (
          <span style={{ color: '#dc2626' }}>✗ {error}</span>
        )}
        {!loading && !explanation && !error && (
          <span style={{ color: '#9ca3af' }}>
            {filteredIndices.length} of {data.length} rows
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
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#f9fafb')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
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
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', justifyContent: 'flex-end' }}>
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