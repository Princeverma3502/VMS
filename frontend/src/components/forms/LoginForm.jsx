import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="loginForm" name="loginForm" autoComplete="off">
      {/* Global Error Message Display */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <Input 
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        required
      />

      <Input 
        label="Password"
        type="password"
        name="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        <LogIn size={18} /> Sign In
      </Button>
    </form>
  );
};

export default LoginForm;