import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const AdminOnly = ({ children, fallback = null }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return fallback;
  return children;
};

export default AdminOnly;
