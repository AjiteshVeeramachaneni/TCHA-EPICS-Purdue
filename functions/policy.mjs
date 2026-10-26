import { createHash, randomBytes } from 'node:crypto'
export class AdminError extends Error {
  constructor(code, message) { super(message); this.code = code }
}
export function requireValue(condition, code, message) {
  if (!condition) throw new AdminError(code, message)
}
export const hash = value => createHash('sha256').update(value).digest('hex')
export const newCode = () => randomBytes(32).toString('base64url')
export function emailValue(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
  requireValue(email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'invalid-argument', 'Enter a valid email address.')
  return email
}
export function setupValues(data = {}) {
  const email = emailValue(data.email)
  const username = typeof data.username === 'string' ? data.username.trim().toLowerCase() : ''
  requireValue(/^[a-z][a-z0-9_-]{2,29}$/.test(username), 'invalid-argument', 'Use 3–30 letters, numbers, underscores or hyphens. Start with a letter.')
  requireValue(typeof data.password === 'string' && data.password.length >= 12 && data.password.length <= 128, 'invalid-argument', 'Use a password with 12–128 characters.')
  requireValue(typeof data.code === 'string' && /^[A-Za-z0-9_-]{43}$/.test(data.code), 'permission-denied', 'This invitation is invalid or expired.')
  return { email, username, password: data.password, code: data.code }
}
export function eventValues(data = {}) {
  requireValue(Number.isInteger(data.id) && data.id >= 1 && data.id <= 10, 'invalid-argument', 'Choose a valid event.')
  requireValue(Number.isInteger(data.revision) && data.revision >= 0, 'invalid-argument', 'Invalid content revision.')
  const result = { id: data.id }
  for (const [key, max] of [['title', 120], ['year', 80], ['summary', 2000], ['source', 500]]) {
    const value = typeof data[key] === 'string' ? data[key].trim() : ''
    requireValue(value.length > 0 && value.length <= max, 'invalid-argument', 'Enter ' + key + ' (up to ' + max + ' characters).')
    result[key] = value
  }
  return result
}
