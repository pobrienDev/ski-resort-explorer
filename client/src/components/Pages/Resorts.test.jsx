import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Resorts from './Resorts'

const navigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}))

const state = { resorts: [], loading: false, error: null }
vi.mock('../../data/useResorts', () => ({ useResorts: () => state }))

const ROWS = [
  { resortID: 1, resort_name: 'Vail', state_name: 'Colorado', summit: '3526.5400', base: '2474.9800', vertical: '1051.5600', lifts: 32, runs: 278, acres: 5317, green_percent: 18, blue_percent: 29, black_percent: 53, double_black_percent: 0 },
  { resortID: 2, resort_name: 'Alta Ski Area', state_name: 'Utah', summit: '3216.0000', base: '2600.0000', vertical: '640.0000', lifts: 7, runs: 119, acres: 2614, green_percent: 15, blue_percent: 30, black_percent: 55, double_black_percent: 0 },
  { resortID: 3, resort_name: 'Lake Louise', state_name: 'Alberta', summit: '2637.0000', base: '1646.0000', vertical: '991.0000', lifts: 11, runs: 164, acres: 4200, green_percent: 25, blue_percent: 45, black_percent: 19, double_black_percent: 11 },
]

const bodyNames = () =>
  within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row').map((row) => within(row).getAllByRole('cell')[0].textContent)

beforeEach(() => {
  navigate.mockClear()
  Object.assign(state, { resorts: ROWS, loading: false, error: null })
})

const renderPage = () => render(<MemoryRouter><Resorts /></MemoryRouter>)

describe('Resorts table', () => {
  it('lists every resort sorted by name with a count', () => {
    renderPage()
    expect(screen.getByText('3 resorts')).toBeInTheDocument()
    expect(bodyNames()).toEqual(['Alta Ski Area', 'Lake Louise', 'Vail'])
  })

  it('converts elevations to feet with separators', () => {
    renderPage()
    const vail = screen.getByText('Vail').closest('tr')
    expect(within(vail).getByText('11,570')).toBeInTheDocument()
    expect(within(vail).getByText('3,450')).toBeInTheDocument()
    expect(within(vail).getByText('5,317')).toBeInTheDocument()
  })

  it('filters by search text across name and location', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'alber' } })
    expect(bodyNames()).toEqual(['Lake Louise'])
    expect(screen.getByText('1 of 3 resorts')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'zzz' } })
    expect(screen.getByText('No resorts match.')).toBeInTheDocument()
  })

  it('toggles sort direction on a column header', () => {
    renderPage()
    const lifts = screen.getByRole('button', { name: /^Lifts/ })
    fireEvent.click(lifts)
    expect(bodyNames()).toEqual(['Alta Ski Area', 'Lake Louise', 'Vail'])
    fireEvent.click(lifts)
    expect(bodyNames()).toEqual(['Vail', 'Lake Louise', 'Alta Ski Area'])
    expect(lifts.closest('th')).toHaveAttribute('aria-sort', 'descending')
  })

  it('opens the detail page when a row is clicked', () => {
    renderPage()
    fireEvent.click(screen.getByText('Lake Louise'))
    expect(navigate).toHaveBeenCalledWith('/resorts/3')
  })

  it('shows the shared loading and error states', () => {
    Object.assign(state, { resorts: [], loading: true })
    const { unmount } = renderPage()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    unmount()
    Object.assign(state, { loading: false, error: 'Failed to load resorts.' })
    renderPage()
    expect(screen.getByText('Failed to load resorts.')).toBeInTheDocument()
  })
})
