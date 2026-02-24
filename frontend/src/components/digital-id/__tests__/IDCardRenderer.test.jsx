import { render, screen } from '@testing-library/react'
import IDCardRenderer from '../IDCardRenderer'
import React from 'react'

describe('IDCardRenderer', () => {
  it('renders user name when provided', () => {
    render(
      <IDCardRenderer user={{ name: 'Test User' }} config={{ collegeLogo: '', councilLogo: '' }} />
    )
    expect(screen.getByText(/test user/i)).toBeInTheDocument()
  })
})
