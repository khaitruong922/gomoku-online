import { createContext, useContext } from 'react'
import useCountdown from '../hooks/useCountdown'

const CountdownContext = createContext()

export const useCountdownContext = () => {
    const context = useContext(CountdownContext)
    return context
}

export const CountdownContextProvider = ({ children }) => {
    const countdown = useCountdown({ initialTotalSec: 1 })
    return (
        <CountdownContext.Provider value={countdown}>
            {children}
        </CountdownContext.Provider>
    )
}

export default CountdownContext