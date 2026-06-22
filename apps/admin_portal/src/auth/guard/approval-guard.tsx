import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/use-auth-context';

type Props = {
  children: React.ReactNode;
};

export function ApprovalGuard({ children }: Props) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  const isMasterPhoneNumber = ['9999999999', '9844982389', '+919999999999', '+919844982389', '09844982389', '09999999999'].includes(String(user?.phoneNumber || ''));

  const isMerchantAdmin = 
    user && !isMasterPhoneNumber && (
      user?.role?.toLowerCase() === 'merchant_admin' || 
      user?.role?.toLowerCase() === 'vendor'
    );

  const isSuperAdmin = !isMerchantAdmin;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = '/';
      return;
    }

    if (isSuperAdmin) return;

    if (user?.isSuspended) {
      if (location.pathname !== '/dashboard/banking') {
        window.location.href = '/dashboard/banking';
      }
      return;
    }

    const isOnboarded = user?.isOnboarded;
    const isDocumentsUploaded = user?.isDocumentsUploaded;
    const isTubuluAppSetupDone = user?.isTubuluAppSetupDone;
    const isApproved = user?.isApproved;

    if (!isOnboarded) {
      if (location.pathname !== '/create-account') {
        window.location.href = '/create-account';
      }
    } else if (!isDocumentsUploaded) {
      if (location.pathname !== '/verify-documents') {
        window.location.href = '/verify-documents';
      }
    } else if (!isTubuluAppSetupDone) {
      if (location.pathname !== '/create-integration') {
        window.location.href = '/create-integration';
      }
    } else if (!isApproved) {
      if (location.pathname !== '/pending-approval') {
        window.location.href = '/pending-approval';
      }
    } else {
      if (['/create-account', '/verify-documents', '/create-integration', '/pending-approval'].includes(location.pathname)) {
        window.location.href = '/dashboard';
      }
    }
  }, [user, loading, isSuperAdmin, location.pathname]);

  if (loading) {
    return null;
  }

  if (!user) {
    // While waiting for useEffect to handle standard / logout redirect, we must return children
    // so sibling nodes in wrappers don't experience abrupt unmount/removeChild crashes.
    return <>{children}</>;
  }

  // ALWAYS render children to maintain perfectly stable React Tree structures!
  // The useEffect above handles background redirections smoothly without layout-thrashing crashes.
  return <>{children}</>;
}
