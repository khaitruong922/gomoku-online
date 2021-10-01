const isLocal = true
export const socketEndpoint = isLocal ? 'ws://localhost:3000' : 'ws://gomokuserver.herokuapp.com'
export const apiEndpoint = isLocal ? 'http://localhost:3000' : 'https://gomokuserver.herokuapp.com'