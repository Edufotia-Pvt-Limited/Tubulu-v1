import isEqual from 'lodash/isEqual';
import { useEffect, useMemo, useCallback, useState } from 'react';
// hooks
import { useLocalStorage } from 'src/hooks/use-local-storage';
// auth
import { useAuthContext } from 'src/auth/hooks';
// utils
import { localStorageGetItem } from 'src/utils/storage-available';
//
import { SettingsValueProps } from '../types';
import { SettingsContext } from './settings-context';

// ----------------------------------------------------------------------

type SettingsProviderProps = {
  children: React.ReactNode;
  defaultSettings: SettingsValueProps;
};

export function SettingsProvider({ children, defaultSettings }: SettingsProviderProps) {
  // `loading` = true while the JWT/session is still being validated on first mount.
  // During that window we use a stable placeholder key so the theme does NOT flicker
  // from a previous guest value before auth resolves (Fix #3).
  const { user, loading } = useAuthContext();

  const [openDrawer, setOpenDrawer] = useState(false);

  // Key is memoized so it only recomputes when auth state actually changes (Fix #1, #3).
  //   - loading    → 'settings-initializing'  (stable; avoids flash)
  //   - logged in  → 'settings-<role>-<id>'   (fully isolated per user)
  //   - logged out → 'settings-guest'          (renamed from 'settings'; Fix #1)
  const settingsKey = useMemo(() => {
    if (loading) return 'settings-initializing';
    if (user) return `settings-${user.role}-${user.id || user._id || user.phoneNumber}`;
    return 'settings-guest';
  }, [loading, user]);

  const [settings, setSettings] = useLocalStorage(settingsKey, defaultSettings);

  const isArabic = localStorageGetItem('i18nextLng') === 'ar';

  useEffect(() => {
    if (isArabic) {
      onChangeDirectionByLang('ar');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArabic]);

  const onUpdate = useCallback(
    (name: string, value: string | boolean) => {
      setSettings((prevState: SettingsValueProps) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setSettings]
  );

  // Direction by lang
  const onChangeDirectionByLang = useCallback(
    (lang: string) => {
      onUpdate('themeDirection', lang === 'ar' ? 'rtl' : 'ltr');
    },
    [onUpdate]
  );

  // Reset
  const onReset = useCallback(() => {
    setSettings(defaultSettings);
  }, [defaultSettings, setSettings]);

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(settings, defaultSettings);

  const memoizedValue = useMemo(
    () => ({
      ...settings,
      onUpdate,
      // Direction
      onChangeDirectionByLang,
      // Reset
      canReset,
      onReset,
      // Drawer
      open: openDrawer,
      onToggle: onToggleDrawer,
      onClose: onCloseDrawer,
    }),
    [
      onReset,
      onUpdate,
      settings,
      canReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      onChangeDirectionByLang,
    ]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
