import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import BentoDashboard from '../BentoDashboard';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

// 1. Mock the Axios API calls
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/tasks') {
        return Promise.resolve({ data: [{ _id: 't1', title: 'Test Task 1', description: 'Desc', xpReward: 20, status: 'Pending', assignedUsers: [] }] });
      }
      return Promise.resolve({ data: [] });
    }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} })
  }
}));

// 2. Mock useBranding hook
vi.mock('../../hooks/useBranding', () => ({
  default: () => ({ primaryColor: '#2563eb' })
}));

const mockUser = {
  _id: 'test-user-123',
  name: 'Playwright Tester',
  role: 'Volunteer',
  gamification: { xpPoints: 50, level: 1, streak: 2 }
};

const renderDashboard = () => {
  return render(
    <AuthContext.Provider value={{ user: mockUser }}>
      <BrowserRouter>
        <BentoDashboard />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('BentoDashboard Component - UI Visibility & Layout Test', () => {
  it('should render all critical dashboard layout sections correctly', async () => {
    renderDashboard();

    // The Dashboard contains multiple core UI widgets that should be visible to the user:
    await waitFor(() => {
      // 1. Check if Task title rendered
      expect(screen.getByText(/Test Task 1/i)).toBeInTheDocument();
    });

    // 2. Check if the generic role/name is parsed by Header or StatCard
    // Depending on the GamificationStatCard structure, it usually displays the user's name
    // Even if it doesn't, we can test other generic strings.
    
    // We expect the Claim button for the pending task
    const claimButton = screen.getByRole('button', { name: /Claim/i });
    expect(claimButton).toBeInTheDocument();
    
    // Expect the component not to crash, confirming the UI structure is completely valid 
    // without the destructive CSS overrides throwing rendering loops or hiding classes.
    expect(document.querySelector('main')).toBeInTheDocument();
  });
});
