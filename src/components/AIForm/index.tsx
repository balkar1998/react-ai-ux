import React, { useState } from 'react'
import { AIFormProps, AIFormField } from './types'
import { useAIValidation } from './useAIValidation'

export function AIForm({
  fields,
  onSubmit,
  apiKey,
  proxyUrl,
  language,
  submitLabel = 'Submit',
  className,
}: AIFormProps) {
  const [values, setValues] = useState(
    fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {} as Record<string, string>)
  )

  const { validations, loadingFields, validateField, clearValidation } =
    useAIValidation({ apiKey, proxyUrl, language })

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    clearValidation(name)
  }

  const handleBlur = (field: AIFormField) => {
    validateField(field, values[field.name])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const allValid = fields.every((f) => {
      if (f.required && !values[f.name].trim()) return false
      const v = validations[f.name]
      return !v || v.valid
    })
    if (allValid) onSubmit(values)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const renderField = (field: AIFormField) => {
    const validation = validations[field.name]
    const borderColor = validation
      ? validation.valid
        ? '#22c55e'
        : '#ef4444'
      : '#d1d5db'

    const sharedStyle = { ...inputStyle, borderColor }

    if (field.type === 'textarea') {
      return (
        <textarea
          id={field.name}
          value={values[field.name]}
          placeholder={field.placeholder || ''}
          rows={4}
          style={sharedStyle}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleChange(field.name, e.target.value)
          }
          onBlur={() => handleBlur(field)}
        />
      )
    }

    if (field.type === 'select') {
      return (
        <select
          id={field.name}
          value={values[field.name]}
          style={sharedStyle}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange(field.name, e.target.value)
          }
          onBlur={() => handleBlur(field)}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        id={field.name}
        type={field.type}
        value={values[field.name]}
        placeholder={field.placeholder || ''}
        style={sharedStyle}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(field.name, e.target.value)
        }
        onBlur={() => handleBlur(field)}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className} style={{ width: '100%' }}>
      {fields.map((field) => {
        const validation = validations[field.name]
        const isLoading = loadingFields[field.name]

        return (
          <div key={field.name} style={{ marginBottom: '16px' }}>
            <label
              htmlFor={field.name}
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '4px',
                color: '#374151',
              }}
            >
              {field.label}
              {field.required && (
                <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
              )}
            </label>

            {renderField(field)}

            <div style={{ minHeight: '20px', marginTop: '4px' }}>
              {isLoading && (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Checking...
                </span>
              )}
              {!isLoading && validation && (
                <span
                  style={{
                    fontSize: '12px',
                    color: validation.valid ? '#16a34a' : '#dc2626',
                  }}
                >
                  {validation.valid ? '✓ ' : '✗ '}
                  {validation.message}
                </span>
              )}
            </div>
          </div>
        )
      })}

      <button
        type="submit"
        style={{
          padding: '10px 24px',
          backgroundColor: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          marginTop: '8px',
        }}
      >
        {submitLabel}
      </button>
    </form>
  )
}