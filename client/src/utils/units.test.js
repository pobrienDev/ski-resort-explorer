import { describe, it, expect } from 'vitest'
import { toFeet, formatFeet } from './units'

describe('toFeet', () => {
  it('converts metres (as the API serializes them) to whole feet', () => {
    expect(toFeet('1200.6100')).toBe(3939)
    expect(toFeet(1000)).toBe(3281)
    expect(toFeet('0.0000')).toBe(0)
  })

  it('returns null for missing or non-numeric values', () => {
    expect(toFeet(null)).toBeNull()
    expect(toFeet(undefined)).toBeNull()
    expect(toFeet('')).toBeNull()
    expect(toFeet('abc')).toBeNull()
  })
})

describe('formatFeet', () => {
  it('adds thousands separators and an optional unit', () => {
    expect(formatFeet(3939)).toBe('3,939')
    expect(formatFeet(3939, { unit: true })).toBe('3,939 ft')
    expect(formatFeet(250, { unit: true })).toBe('250 ft')
  })

  it('renders an em dash for null', () => {
    expect(formatFeet(null)).toBe('—')
    expect(formatFeet(null, { unit: true })).toBe('—')
  })
})
