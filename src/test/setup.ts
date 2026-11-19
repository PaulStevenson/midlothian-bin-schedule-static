import '@testing-library/jest-dom/vitest'

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: () => 'blob:test-url',
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: () => {},
})
