import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ResortDetail from './ResortDetail'

const navigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
  useParams: () => ({ resortID: '42' }),
}))

const state = { resort: null, loading: false, error: null, notFound: false }
vi.mock('../../data/useResorts', () => ({ useResort: () => state }))
vi.mock('../../api', () => ({ fetchWeather: vi.fn(), WEATHER_TILE_URL: '/api/weather/tiles/{z}/{x}/{y}.png' }))

const RESORT = {
  resortID: 42, resort_name: 'Revelstoke', state_name: 'British Columbia',
  summit: '2225.0000', base: '512.0000', vertical: '1713.0000', lifts: 6, runs: 75, acres: 3121,
  green_percent: 12, blue_percent: 43, black_percent: 45, double_black_percent: 0,
  lat: '50.9583', lon: '-118.1637', url: 'https://www.revelstokemountainresort.com/',
  source_url: 'https://www.revelstokemountainresort.com/mountain/stats', verified_on: 'Mon, 05 Oct 2026 00:00:00 GMT',
}

const renderPage = () => render(<MemoryRouter><ResortDetail /></MemoryRouter>)

beforeEach(() => {
  navigate.mockClear()
  Object.assign(state, { resort: RESORT, loading: false, error: null, notFound: false })
  window.history.replaceState(null, '')
})

describe('ResortDetail', () => {
  it('shows the stats in feet, the published vertical, and acres', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Revelstoke' })).toBeInTheDocument()
    expect(screen.getByText('7,300 ft')).toBeInTheDocument()
    expect(screen.getByText('1,680 ft')).toBeInTheDocument()
    expect(screen.getByText('5,620 ft')).toBeInTheDocument()
    expect(screen.getByText('3,121')).toBeInTheDocument()
  })

  it('links to the official website in the header and the stats source below', () => {
    renderPage()
    const site = screen.getByRole('link', { name: /Official website/ })
    expect(site).toHaveAttribute('href', RESORT.url)
    expect(site).toHaveAttribute('target', '_blank')
    expect(screen.getByText(/Stats verified against/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'revelstokemountainresort.com' })).toHaveAttribute('href', RESORT.source_url)
  })

  it('links the location chip to the filtered table', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'British Columbia' })).toHaveAttribute('href', '/resorts?location=British%20Columbia')
  })

  it('hides the difficulty section when a resort has no ratings', () => {
    Object.assign(state, { resort: { ...RESORT, green_percent: null, blue_percent: null, black_percent: null, double_black_percent: null } })
    renderPage()
    expect(screen.queryByText('Trail difficulty')).not.toBeInTheDocument()
  })

  it('goes home from Back when the page was opened directly', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Back/ }))
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('goes back in history when there is somewhere to go', () => {
    window.history.replaceState({ idx: 2 }, '')
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Back/ }))
    expect(navigate).toHaveBeenCalledWith(-1)
  })

  it('shows not found once the list has loaded without the id', () => {
    Object.assign(state, { resort: null, notFound: true })
    renderPage()
    expect(screen.getByText('Resort not found.')).toBeInTheDocument()
  })
})
