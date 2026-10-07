import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DifficultyBar from './DifficultyBar'

describe('DifficultyBar', () => {
  it('renders nothing when a resort has no ratings', () => {
    const { container } = render(
      <DifficultyBar resort={{ green_percent: null, blue_percent: null, black_percent: null, double_black_percent: null }} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a legend entry per non-zero rating, with the percentage in text', () => {
    render(
      <DifficultyBar
        resort={{ green_percent: 20, blue_percent: 50, black_percent: 30, double_black_percent: 0 }}
        showLegend
      />,
    )
    expect(screen.getByText('Green 20%')).toBeInTheDocument()
    expect(screen.getByText('Blue 50%')).toBeInTheDocument()
    expect(screen.getByText('Black 30%')).toBeInTheDocument()
    expect(screen.queryByText(/Double Black/)).not.toBeInTheDocument()
  })

  it('accepts the string percentages older API responses used', () => {
    render(<DifficultyBar resort={{ green_percent: '10', blue_percent: '60', black_percent: '30' }} showLegend />)
    expect(screen.getByText('Blue 60%')).toBeInTheDocument()
  })
})
