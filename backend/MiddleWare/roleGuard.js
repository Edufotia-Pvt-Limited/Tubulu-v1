const ROLE_PERMISSIONS = {
  // Snake_case (canonical internal roles)
  super_admin:            ['*'],
  ops_admin:              ['view:vendors', 'approve:vendors', 'manage:ads'],
  onboarding_specialist:  ['create:vendors', 'upload:docs'],
  content_moderator:      ['approve:catalogue', 'approve:products', 'manage:ads'],
  finance_admin:          ['view:settlements', 'trigger:payouts'],
  regional_partner:       ['manage:region'],
  merchant_admin:         ['manage:own_store'],
  enabler:                ['create:vendors', 'upload:docs', 'view:own_submissions'],
  // PascalCase aliases (used by Integration JWT tokens)
  SuperAdmin:             ['*'],
  MerchantAdmin:          ['manage:own_store'],
  OpsAdmin:               ['view:vendors', 'approve:vendors', 'manage:ads'],
};

const roleGuard = (...allowedRolesOrPermissions) => (req, res, next) => {
  const userRole = req.user?.role;
  if (!userRole) {
    return res.status(403).json({ message: 'Forbidden: No role found' });
  }

  // Super admin bypasses everything
  if (ROLE_PERMISSIONS[userRole]?.includes('*')) {
    return next();
  }

  // Check if user has the specific role required
  if (allowedRolesOrPermissions.includes(userRole)) {
    return next();
  }

  // Check if user has the required permission
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  const hasPermission = allowedRolesOrPermissions.some(p => userPermissions.includes(p));

  if (hasPermission) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
};

module.exports = roleGuard;
