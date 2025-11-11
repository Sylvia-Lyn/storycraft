/**
 * Test Authentication Helper
 * This file provides utilities to inject test credentials into localStorage for development/testing
 * Only use this during development when the authentication backend is not available
 */

export const testCredentials = {
  user: {
    user_id: 0,
    user_name: 'test_001',
    user_email: 'testEmail@test.com',
    user_plan: 'multilingual' as const,
    user_point: '121300',
    subscription_expires_at: '2026-09-12T09:51:17.339Z',
    subscription_status: 'free' as const,
    userId: '19660816726884352200'
  },
  token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL3N0cm95Y3JhZnQtMWdobWk0b2pkM2I0YTIwYi5hcC1zaGFuZ2hhaS50Y2ItYXBpLnRlbmNlbnRjbG91ZGFwaS5jb20iLCJzdWIiOiIxOTY2MDgxNjcyNjg4NDM1MjAwIiwiYXVkIjoic3Ryb3ljcmFmdC0xZ2htaTRvamQzYjRhMjBiIiwiZXhwIjoxNzU5ODUwNTI0LCJpYXQiOjE3NTk4NDMzMjQsImF0X2hhc2giOiJyLjVGWmVMNFNEUkdLbS1rWkdjekwxdmciLCJzY29wZSI6InVzZXIgc3NvIiwicHJvamVjdF9pZCI6InN0cm95Y3JhZnQtMWdobWk0b2pkM2I0YTIwYiIsInByb3ZpZGVyX3R5cGUiOiJ1c2VybmFtZSIsIm1ldGEiOnsid3hPcGVuSWQiOiIiLCJ3eFVuaW9uSWQiOiIifSwidXNlcl9pZCI6IjE5NjYwODE2NzI2ODg0MzUyMDAiLCJ1c2VyX3R5cGUiOiJleHRlcm5hbCJ9.YoxB8o5DY4VTqja1ZRpYWlQMo-K5PeHKl8wLjSsivSlZi3pX-7mw0vS25fYjA1IbaUBZEsZlo9YdY9hHQgekqFz8YOpfzgD3-PBtBdL_t1F4hxMCAjm5Balnls5JgP4RrMXQjXcw-YxXuP8SjLEInc8IWfN_O9JvoFTpAtjhYQwv1-RfjpHPhJMdWM8bpxrCR1CXRAxK3vyz6jsscRvOQLKYmUwm6EG0PJH9iXSlduJoHysxlVMfGSlzLoZCrGkJBdbeM5mJ0Dwk9e40Ups1BsacfdveFsLYh8sdysDz1eu_nVvmcyeEA4gVi3c7bLs4gfCX4islm_430Q8RsrjK4Q'
};

/**
 * Inject test credentials into localStorage
 * Use this for testing when the authentication backend is not available
 */
export function injectTestCredentials(): void {
  try {
    localStorage.setItem('user', JSON.stringify(testCredentials.user));
    localStorage.setItem('token', testCredentials.token);
    console.log('✅ Test credentials injected successfully');
    console.log('User:', testCredentials.user);
  } catch (error) {
    console.error('❌ Failed to inject test credentials:', error);
  }
}

/**
 * Clear test credentials from localStorage
 */
export function clearTestCredentials(): void {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('✅ Test credentials cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear test credentials:', error);
  }
}

/**
 * Check if test credentials are currently set
 */
export function hasTestCredentials(): boolean {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  return !!(user && token);
}
