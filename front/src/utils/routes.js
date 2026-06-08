// src/utils/routes.js
import { ROLES } from './constants';

export const getDefaultRoute = (user) => {
  if (!user || !user.roleId) return '/report';

  switch (user.roleId) {
    case ROLES.STOREKEEPER:  // 1
      return '/stock';
    case ROLES.DIRECTOR:     // 2
      return '/report';
    case ROLES.OFFICE_WORKER: // 3
      return '/orders';
    case ROLES.TRUSTED_PERSON: // 4
      return '/upd';
    case ROLES.DRIVER:
      return '/trips';
    default:
      return '/report';
  }
};