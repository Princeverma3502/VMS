import { render, screen } from '@testing-library/react'
import CreateEventForm from '../../forms/CreateEventForm'
import React from 'react'
import { AuthContext } from '../../../context/AuthContext'

describe('CreateEventForm', () => {
  it('renders form fields', () => {
    render(
      <AuthContext.Provider value={{ user: { role: 'Secretary' } }}>
        <CreateEventForm onSubmit={() => {}} />
      </AuthContext.Provider>
    )
    expect(screen.getByPlaceholderText(/e\.g\. Campus Clean Drive/i)).toBeInTheDocument()
  })
})
