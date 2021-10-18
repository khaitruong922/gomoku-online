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

export default function Board({ isPlaying, stone, roomId, isMyTurn, onMove, sec }) {
    const [board, setBoard] = useState(clone2D(emptyBoard))
    const socket = useContext(SocketContext)
    const player = useAuthStore(s => s.player)
    const { _id: playerId } = player || {}

    useEffect(() => {
        console.log('board use effect')
        const addMove = (({ r, c, stone }) => {
            setBoard(board => {
                const newBoard = clone2D(board)
                newBoard[r][c] = stone
                return newBoard
            })
        })

        const startGameHandler = () => {
            setBoard(clone2D(emptyBoard))
        }

        const moveHandler = ({ r, c, stone }) => {
            console.log({ r, c, stone })
            addMove({ r, c, stone })
        }

        const resetBoardHandler = () => {
            setBoard(clone2D(emptyBoard))
        }

        socket.on('startGame', startGameHandler)
        socket.on('move', moveHandler)
        socket.on('resetBoard', resetBoardHandler)

        return () => {
            socket.off('move', moveHandler)
            socket.off('startGame', startGameHandler)
            socket.off('resetBoardHandler')

            console.log('board unmounted')
        }
    }, [socket])

    const clickable = isPlaying && isMyTurn && sec > 0

    function onCellClick({ r, c }) {
        if (!clickable) return
        if (board[r][c] !== E) return
        socket.emit('move', { playerId, r, c, roomId })
        onMove()
    }

    return (
        <Box p={4}>
            <SimpleGrid mx='auto' w={NUM_ROW * CELL_SIZE} columns={NUM_COL} >
                {board.map((row, r) =>
                    row.map((stone, c) =>
                        <Cell key={r * NUM_COL + c} r={r} c={c} stone={board[r][c]} clickable={clickable && stone === E} onClick={() => onCellClick({ r, c })} />
                    )
                )}
            </SimpleGrid>

        </Box>
    )
}