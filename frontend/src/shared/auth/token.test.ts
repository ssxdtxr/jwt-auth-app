import { clearToken, getToken, onSessionExpire, sessionExpire, setToken } from './token';

beforeEach(() => {
  clearToken();
  onSessionExpire(null);
});

describe('token store', () => {
  it('returns null initially', () => {
    expect(getToken()).toBeNull();
  });

  it('stores and retrieves a token', () => {
    setToken('abc.def.ghi');
    expect(getToken()).toBe('abc.def.ghi');
  });

  it('clears the token', () => {
    setToken('abc.def.ghi');
    clearToken();
    expect(getToken()).toBeNull();
  });

  it('overwrites a previous token', () => {
    setToken('first');
    setToken('second');
    expect(getToken()).toBe('second');
  });
});

describe('sessionExpire', () => {
  it('clears the token', () => {
    setToken('abc');
    sessionExpire();
    expect(getToken()).toBeNull();
  });

  it('calls the registered callback', () => {
    const cb = vi.fn();
    onSessionExpire(cb);
    sessionExpire();
    expect(cb).toHaveBeenCalledOnce();
  });

  it('does not throw when no callback is registered', () => {
    expect(() => sessionExpire()).not.toThrow();
  });

  it('last registered callback wins', () => {
    const first = vi.fn();
    const second = vi.fn();
    onSessionExpire(first);
    onSessionExpire(second);
    sessionExpire();
    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
  });
});
