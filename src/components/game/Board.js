import { Box, Flex, SimpleGrid } from "@chakra-ui/layout"
import { useCallback, useContext, useEffect, useState } from "react"
import SocketContext from "../../context/SocketContext"
import useAuthStore from "../../stores/useAuthStore"
import clone2D from "../../util/clone2D"
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

export default function Board({ isPlaying, stone, roomId, isMyTurn, onMove }) {
    const [board, setBoard] = useState(clone2D(emptyBoard))
    const socket = useContext(SocketContext)
    const player = useAuthStore(s => s.player)
    const { _id: playerId } = player || {}

    useEffect(() => {
        const addMove = (({ r, c, stone }) => {
            setBoard(board => {
                const newBoard = clone2D(board)
                newBoard[r][c] = stone
                return newBoard
            })
        })
        console.log('board use effect')
        const startGameHandler = () => {
            setBoard(clone2D(emptyBoard))
        }
        socket.on('startGame', startGameHandler)
        socket.on('move', ({ r, c, stone }) => {
            console.log({ r, c, stone })
            addMove({ r, c, stone })
        })
        socket.on('resetBoard', () => {
            setBoard(clone2D(emptyBoard))
        })
        return () => {
            socket.off('move')
            socket.off('startGame', startGameHandler)
            console.log('board unmounted')
        }
    }, [socket])


    function onCellClick({ r, c }) {
        if (!isMyTurn) return
        if (board[r][c] !== E) return
        socket.emit('move', { playerId, r, c, roomId })
        onMove()
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