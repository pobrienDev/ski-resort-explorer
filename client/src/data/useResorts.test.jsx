import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ResortsProvider from './ResortsProvider'
import { useResorts, useResort } from './useResorts'

vi.mock('../api', () => ({ fetchResorts: vi.fn() }))
import { fetchResorts } from '../api'

const ROWS = [
  { resortID: 1, resort_name: 'Alyeska Resort' },
  { resortID: 2, resort_name: 'Eaglecrest Ski Area' },
]

function List() {
  const { resorts, loading, error } = useResorts()
  if (loading) return <p>loading</p>
  if (error) return <p>{error}</p>
  return <ul>{resorts.map((r) => <li key={r.resortID}>{r.resort_name}</li>)}</ul>
}

function One({ id }) {
  const { resort, loading, notFound } = useResort(id)
  if (loading) return <p>loading</p>
  if (notFound) return <p>not found</p>
  return <p>{resort.resort_name}</p>
}

beforeEach(() => {
  fetchResorts.mockClear()
})

describe('ResortsProvider', () => {
  it('fetches once and shares the list with every consumer', async () => {
    fetchResorts.mockResolvedValue(ROWS)
    render(
      <ResortsProvider>
        <List />
        <List />
        <One id="2" />
      </ResortsProvider>,
    )
    expect(screen.getAllByText('loading')).toHaveLength(3)
    await waitFor(() => expect(screen.getAllByText('Alyeska Resort')).toHaveLength(2))
    expect(screen.getByText('Eaglecrest Ski Area', { selector: 'p' })).toBeInTheDocument()
    expect(fetchResorts).toHaveBeenCalledTimes(1)
  })

  it('reports not found only after the list has loaded', async () => {
    fetchResorts.mockResolvedValue(ROWS)
    render(
      <ResortsProvider>
        <One id={999} />
      </ResortsProvider>,
    )
    expect(screen.getByText('loading')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('not found')).toBeInTheDocument())
  })

  it('surfaces a load error', async () => {
    fetchResorts.mockImplementation(() => Promise.reject(new Error('boom')))
    render(
      <ResortsProvider>
        <List />
      </ResortsProvider>,
    )
    await waitFor(() => expect(screen.getByText(/Failed to load resorts/)).toBeInTheDocument())
    expect(fetchResorts).toHaveBeenCalledTimes(1)
  })

  it('throws when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<List />)).toThrow(/inside <ResortsProvider>/)
    console.error.mockRestore()
  })
})
