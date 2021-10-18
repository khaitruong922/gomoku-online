import { useEffect, useRef, useState } from "react";

export default function useCountdown({ initialTotalSec = 10 }) {
    const [totalSec, setTotalSec] = useState(initialTotalSec)
    const [sec, setSec] = useState(0)
    const intervalRef = useRef(null)
    const secPerRender = 0.5
    function start() {
        const id = setInterval(() => {
            setSec(sec => {
                if (sec <= 0) return null
                const newSec = Math.max(0, sec - secPerRender)
                return newSec
            })
        }, secPerRender * 1000)
        intervalRef.current = id
    }
    function setToZero() {
        setSec(0)
        clearInterval(intervalRef.current)
    }
    function reset(s) {
        setTotalSec(s)
        setSec(s)
        clearInterval(intervalRef.current)
        start()
    }
    useEffect(() => {
        return () => clearInterval(intervalRef.current)
    }, [])
    const percentage = totalSec === 0 ? 0 : 100 * (sec / totalSec)
    return { sec, reset, percentage, start, setToZero }
}