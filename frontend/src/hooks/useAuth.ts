import { useSelector } from 'react-redux';
import { type RootState } from '../store';

export function useAuth() {
  const auth = useSelector((state: RootState) => state.auth);
  return auth;
}