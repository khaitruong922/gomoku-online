import { createContext, useContext } from 'react'
const SocketContext = createContext()

export const useSocket = () => {
    const socket = useContext(SocketContext)
    return socket
}
export default SocketContext