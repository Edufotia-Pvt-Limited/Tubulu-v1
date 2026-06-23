import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();

  const { authenticated, loading } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    // Wait for auth state to finish initializing from storage/API
    if (loading) {
      return;
    }

    if (!authenticated) {
      // Send user to root login — no returnTo param to keep URL clean
      router.replace('/');
    } else {
      setChecked(true);
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked || !authenticated) {
    return null;
  }

  return <>{children}</>;
}
