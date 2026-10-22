import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const CustomerOnly = ({ children, fallback = null }) => {
  const { isCustomer } = useAuth();
  if (!isCustomer) return fallback;
  return children;
};

export default CustomerOnly;
