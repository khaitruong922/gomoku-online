const isLocal = true
export const socketEndpoint = isLocal ? 'ws://localhost:3000' : 'ws://localhost:3000'
export const apiEndpoint = isLocal ? 'http://localhost:3000' : 'http://localhost:3000'