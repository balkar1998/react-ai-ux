export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'password'
  | 'textarea'
  | 'select'

export interface AIFormField {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: { label: string; value: string }[] // for select type
  context?: string // extra hint for Claude e.g. "This is a GSTIN field for Indian businesses"
}

export interface ValidationResult {
  valid: boolean
  message: string
}

export interface AIFormProps {
  fields: AIFormField[]
  onSubmit: (values: Record<string, string>) => void
  apiKey?: string
  proxyUrl?: string
  language?: string
  submitLabel?: string
  className?: string
}