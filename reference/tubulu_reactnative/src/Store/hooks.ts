import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './Store';
// Typed versions of dispatch & selector
// export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppDispatch: () => AppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


