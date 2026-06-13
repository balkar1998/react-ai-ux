import { useState, useCallback } from 'react'
import { askClaude } from '../../utils/claude'
import { AIFormField, ValidationResult } from './types'

interface UseAIValidationOptions {
  apiKey?: string
  proxyUrl?: string
  language?: string
}

export function useAIValidation({
  apiKey,
  proxyUrl,
  language,
}: UseAIValidationOptions) {
    const [validations, setValidations] = useState({} as Record<string, ValidationResult>)
    const [loadingFields, setLoadingFields] = useState({} as Record<string, boolean>)

  const validateField = useCallback(
    async (field: AIFormField, value: string) => {
      if (!value.trim()) {
        if (field.required) {
          setValidations((prev) => ({
            ...prev,
            [field.name]: {
              valid: false,
              message: `${field.label} is required`,
            },
          }))
        }
        return
      }

      setLoadingFields((prev) => ({ ...prev, [field.name]: true }))

      try {
        const prompt = `
You are a form validation assistant.

Field name: "${field.label}"
Field type: "${field.type}"
User entered value: "${value}"
${field.context ? `Extra context: ${field.context}` : ''}

Task: Validate this input and respond ONLY in this exact JSON format, nothing else:
{
  "valid": true or false,
  "message": "your helpful message here"
}

Rules:
- If valid, message should be a short positive confirmation like "Looks good!"
- If invalid, message should explain exactly what is wrong and how to fix it in plain simple language
- Be specific and helpful, not generic
- Never say just "invalid" — always explain why and how to fix
- Keep message under 20 words
        `.trim()

        const raw = await askClaude({ prompt, apiKey, proxyUrl, language })

        const cleaned = raw.replace(/```json|```/g, '').trim()
        const result: ValidationResult = JSON.parse(cleaned)

        setValidations((prev) => ({ ...prev, [field.name]: result }))
      } catch {
        setValidations((prev) => ({
          ...prev,
          [field.name]: {
            valid: false,
            message: 'Could not validate. Please check your input.',
          },
        }))
      } finally {
        setLoadingFields((prev) => ({ ...prev, [field.name]: false }))
      }
    },
    [apiKey, proxyUrl, language]
  )

  const clearValidation = useCallback((fieldName: string) => {
    setValidations((prev) => {
      const next = { ...prev }
      delete next[fieldName]
      return next
    })
  }, [])

  return { validations, loadingFields, validateField, clearValidation }
}