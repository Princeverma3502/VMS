import { createContext } from 'react';

/**
 * Separating the Context object from the Provider component 
 * to comply with ESLint Fast Refresh rules (which expect 
 * context files to only export components).
 */
export const AuthContext = createContext(null);
