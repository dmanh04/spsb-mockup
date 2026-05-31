export function isDevMock(): boolean {
  return localStorage.getItem('dev-mock') === 'true' || import.meta.env.DEV
}

export function enableMock() {
  localStorage.setItem('dev-mock', 'true')
}

export function disableMock() {
  localStorage.removeItem('dev-mock')
}
