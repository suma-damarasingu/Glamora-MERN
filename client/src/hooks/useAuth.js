import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    ...context,
    isLoading: context.loading,
    isAdmin: context.user?.role === 'admin',
    isCustomer: context.user?.role === 'customer',
  };
};

export default useAuth;
