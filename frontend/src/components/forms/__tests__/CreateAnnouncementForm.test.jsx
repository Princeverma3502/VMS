import { render, screen } from '@testing-library/react'
import CreateAnnouncementForm from '../../forms/CreateAnnouncementForm'
import React from 'react'
import { AuthContext } from '../../../context/AuthContext'

describe('CreateAnnouncementForm', () => {
  it('renders title and content fields', () => {
    render(
      <AuthContext.Provider value={{ user: { role: 'Secretary' } }}>
        <CreateAnnouncementForm onSubmit={() => {}} />
      </AuthContext.Provider>
    )
    expect(screen.getByPlaceholderText(/e\.g\., Important Meeting Tomorrow/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Write your announcement here/i)).toBeInTheDocument()
  })
})
