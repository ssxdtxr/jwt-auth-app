// In-memory token store — survives React re-renders, lost on page reload (by design).
// The refresh token cookie restores the session on reload via AuthProvider.

let _token: string | null = null;
let _onExpire: (() => void) | null = null;

export const getToken = (): string | null => _token;
export const setToken = (t: string): void => { _token = t; };
export const clearToken = (): void => { _token = null; };

/** Register a callback invoked when the session expires (refresh fails). */
export const onSessionExpire = (fn: (() => void) | null): void => { _onExpire = fn; };

/** Called by the API interceptor on unrecoverable 401. */
export const sessionExpire = (): void => {
  clearToken();
  _onExpire?.();
};
