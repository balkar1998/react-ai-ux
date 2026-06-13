export interface ClaudeRequestOptions {
  prompt: string
  proxyUrl?: string
  apiKey?: string
  language?: string
}

export async function askClaude({
  prompt,
  proxyUrl,
  apiKey,
  language,
}: ClaudeRequestOptions): Promise<string> {
  const finalPrompt = language
    ? `${prompt}\n\nImportant: Respond in "${language}" language only.`
    : `${prompt}\n\nImportant: Detect the language of the user input and respond in that same language.`

  if (proxyUrl) {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt }),
    })
    if (!res.ok) throw new Error('Proxy request failed')
    const data = await res.json()
    return data.result
  }

  if (apiKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: finalPrompt }],
      }),
    })
    if (!res.ok) throw new Error('Claude API request failed')
    const data = await res.json()
    return data.content[0].text
  }

  throw new Error('Either apiKey or proxyUrl must be provided')
}