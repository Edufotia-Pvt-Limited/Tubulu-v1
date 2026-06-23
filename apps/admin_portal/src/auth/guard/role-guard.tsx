import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/use-auth-context';

type Props = { allowedRoles: string[]; children: React.ReactNode };

export function RoleGuard({ allowedRoles, children }: Props) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return null; // Wait for session to load before checking roles
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const isMasterPhoneNumber = ['9999999999', '9844982389', '+919999999999', '+919844982389', '09844982389', '09999999999'].includes(String(user?.phoneNumber || ''));

  const isMerchantAdmin = 
    user && !isMasterPhoneNumber && (
      user?.role?.toLowerCase() === 'merchant_admin' || 
      user?.role?.toLowerCase() === 'vendor' ||
      user?.role?.toLowerCase() === 'merchant_owner' ||
      user?.role?.toLowerCase() === 'merchant_manager' ||
      user?.role?.toLowerCase() === 'merchant_cashier'
    );

  const isSuperAdmin = !isMerchantAdmin;

  // Derive granular roles
  let currentRole = isSuperAdmin ? 'super_admin' : 'merchant_admin';
  if (user?.role?.toLowerCase() === 'merchant_owner') currentRole = 'merchant_owner';
  if (user?.role?.toLowerCase() === 'merchant_manager') currentRole = 'merchant_manager';
  if (user?.role?.toLowerCase() === 'merchant_cashier') currentRole = 'merchant_cashier';
  if (user?.role?.toLowerCase() === 'enabler') currentRole = 'enabler';
  if (user?.role?.toLowerCase() === 'city_manager') currentRole = 'city_manager';
  if (user?.role?.toLowerCase() === 'state_manager') currentRole = 'state_manager';
  if (user?.role?.toLowerCase() === 'regional_manager') currentRole = 'regional_manager';
  if (user?.role?.toLowerCase() === 'regional_partner') currentRole = 'regional_partner';

  const isAllowed = allowedRoles.includes(currentRole) || 
                    (user?.role?.toLowerCase() === 'super_admin' && allowedRoles.includes('super_admin')) ||
                    (allowedRoles.includes(user?.role?.toLowerCase()));

  if (!isAllowed) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
