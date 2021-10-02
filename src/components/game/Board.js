import { Box, Flex, SimpleGrid } from "@chakra-ui/layout"
import { useCallback, useContext, useEffect, useState } from "react"
import SocketContext from "../../context/SocketContext"
import useAuthStore from "../../stores/useAuthStore"
import Cell from "./Cell"

export const E = ''
export const X = 'X'
export const O = 'O'
export const NUM_COL = 19
export const NUM_ROW = 19
export const CELL_SIZE = 40


const emptyBoard = [
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
    [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E,],
]

export default function Board({ isPlaying, stone, roomId }) {
    const [isMyTurn, setMyTurn] = useState(false)
    const [board, setBoard] = useState(emptyBoard)
    const socket = useContext(SocketContext)
    const player = useAuthStore(s => s.player)
    const { _id: playerId } = player || {}


    const addMove = useCallback(({ r, c, stone }) => {
        if (board[r][c] === stone) return
        board[r][c] = stone
        setBoard(board)
    }, [board])

    useEffect(() => {
        const startGameHandler = ({ stone }) => {
            if (stone === X) setMyTurn(true)

        }
        socket.on('startGame', startGameHandler)
        socket.on('yourTurn', () => {
            console.log('my turn')
            setMyTurn(true)
        })
        socket.on('move', ({ r, c, stone }) => {
            console.log({ r, c, stone })
            addMove({ r, c, stone })
        })

        return () => {
            socket.off('yourTurn')
            socket.off('move')
            socket.off('startGame', startGameHandler)
            console.log('board unmounted')
        }
    }, [socket])


    function onCellClick({ r, c }) {
        if (!isMyTurn) return
        setMyTurn(false)
        addMove({ r, c, stone })
        socket.emit('move', { playerId, r, c, roomId })
    }

    return (
        <Box p={4}>
            <SimpleGrid mx='auto' w={NUM_ROW * CELL_SIZE} columns={NUM_COL} >
                {board.map((row, r) =>
                    row.map((stone, c) =>
                        <Cell key={r * NUM_COL + c} r={r} c={c} stone={board[r][c]} clickable={isPlaying && isMyTurn && stone === E} onClick={() => onCellClick({ r, c })} />
                    )
                )}
            </SimpleGrid>

        </Box>
    )
}