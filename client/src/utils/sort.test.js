import { describe, it, expect } from 'vitest'
import { toComparable, compareResorts, sortResorts } from './sort'

describe('toComparable', () => {
  it('turns numeric strings from the API into numbers', () => {
    expect(toComparable('1200.6100')).toBe(1200.61)
    expect(toComparable(7)).toBe(7)
  })
  it('keeps text as text and maps empty values to null', () => {
    expect(toComparable('Vail')).toBe('Vail')
    expect(toComparable('')).toBeNull()
    expect(toComparable(null)).toBeNull()
    expect(toComparable(undefined)).toBeNull()
  })
})

describe('sortResorts', () => {
  const rows = [
    { resort_name: 'vail', summit: '3526.5400', acres: null },
    { resort_name: 'Alta', summit: '3216.0000', acres: 2614 },
    { resort_name: 'Big Sky', summit: '', acres: 5850 },
  ]

  it('sorts numeric strings numerically, not lexically', () => {
    expect(sortResorts([{ summit: '900' }, { summit: '1000' }], 'summit').map((r) => r.summit)).toEqual(['900', '1000'])
  })

  it('sorts text case-insensitively', () => {
    expect(sortResorts(rows, 'resort_name').map((r) => r.resort_name)).toEqual(['Alta', 'Big Sky', 'vail'])
    expect(sortResorts(rows, 'resort_name', 'desc').map((r) => r.resort_name)).toEqual(['vail', 'Big Sky', 'Alta'])
  })

  it('keeps empty cells last in both directions', () => {
    expect(sortResorts(rows, 'summit').map((r) => r.resort_name)).toEqual(['Alta', 'vail', 'Big Sky'])
    expect(sortResorts(rows, 'summit', 'desc').map((r) => r.resort_name)).toEqual(['vail', 'Alta', 'Big Sky'])
    expect(sortResorts(rows, 'acres', 'desc').map((r) => r.resort_name)).toEqual(['Big Sky', 'Alta', 'vail'])
  })

  it('does not mutate the input and passes it through with no key', () => {
    const copy = [...rows]
    sortResorts(rows, 'summit')
    expect(rows).toEqual(copy)
    expect(sortResorts(rows, null)).toBe(rows)
  })

  it('compareResorts treats two empties as equal', () => {
    expect(compareResorts({ a: null }, { a: '' }, 'a')).toBe(0)
  })
})
