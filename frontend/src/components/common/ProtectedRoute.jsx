import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const normalizeRoleProp = (r) => (r || '').toString().replace(/-/g, ' ').trim().toLowerCase();

const ProtectedRoute = ({ children, role, adminOnly, allowedRoles }) => {
  const { user, loading, hasRole } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-bold text-blue-600">
        Authenticating...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // New Admin Check
  if (adminOnly) {
    if (user.isSuperAdmin || hasRole('secretary', 'admin')) {
      return children;
    }
    return <Navigate to="/unauthorized" />;
  }

  if (allowedRoles && Array.isArray(allowedRoles)) {
    const hasAllowedRole = allowedRoles.some(r => hasRole(normalizeRoleProp(r)));
    if (!hasAllowedRole && !user.isSuperAdmin) {
      return <Navigate to="/unauthorized" />;
    }
    return children;
  }

  if (role) {
    const required = normalizeRoleProp(role);

    // SUPER ADMIN check: if required role is super-admin, check isSuperAdmin flag
    if (required === 'super-admin' && !user.isSuperAdmin) {
      return <Navigate to="/unauthorized" />;
    }

    // If required role is secretary, only allow secretaries
    if (required === 'secretary' && !hasRole('secretary') && !user.isSuperAdmin) {
      return <Navigate to="/unauthorized" />;
    }

    // If required is volunteer but user is secretary, redirect to secretary dashboard
    if (required === 'volunteer' && hasRole('secretary')) {
      return <Navigate to="/secretary/dashboard" />;
    }

    // Generic check: if required role is not matched, deny
    if (!hasRole(required) && !user.isSuperAdmin) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return children;
};

export default ProtectedRoute;