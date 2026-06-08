// src/hooks/usePermissions.js
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ROLE_PERMISSIONS } from '@/utils/constants';

export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission) => {
    if (!user || !user.roleId) return false;
    return ROLE_PERMISSIONS[permission]?.includes(user.roleId) || false;
  };
  
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };
  
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission));
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};