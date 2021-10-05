import { Avatar } from "@chakra-ui/avatar"
import { Button } from "@chakra-ui/button"
import Icon from "@chakra-ui/icon"
import { Box, Flex, GridItem, SimpleGrid, Text } from "@chakra-ui/layout"
import { useContext, useEffect, useRef, useState } from "react"
import { FaCheckCircle, FaCrown } from "react-icons/fa"
import SocketContext, { useSocket } from "../context/SocketContext"
import useAuthStore from "../stores/useAuthStore"
import buildPlayerString from "../util/buildPlayerString"
import { formatNumberWithSign } from "../util/formatNumberWithSign"
import Board, { E, O, X } from "./game/Board"

function PlayerPanel({ player, isPlaying, myStone, isHost = false, isMyTurn, isMe, ready = false }) {
    const stone = (myStone === X && isMe) || (myStone === O && !isMe) ? X : (myStone === O && isMe) || (myStone === X && !isMe) ? O : E
    return (
        <>
            <Text fontWeight={600} color={isPlaying && ((isMyTurn && isMe) || (!isMyTurn && !isMe)) ? 'pink.400' : 'black'} fontSize='2xl' my={2}>Player {isHost ? 1 : 2} {stone ? `(${stone})` : ''}</Text>
            <Flex my={2} p={4} align='center' boxShadow='md'>
                <Avatar boxSize='50px' mr={3} />
                <Text mr={3} fontSize='lg'>{player ? buildPlayerString(player) : 'waiting for player...'}</Text>
                {isHost && <Icon boxSize='20px' as={FaCrown} color='yellow.400' />}
                {!isHost && <Icon boxSize='20px' as={FaCheckCircle} color={ready ? 'green.500' : 'blackAlpha.500'} />}
            </Flex>
        </>
    )
}

function ActivityLog() {
    const height = 200
    const logsRef = useRef(null)
    const socket = useContext(SocketContext)

    const [logs, setLogs] = useState([])

    function addLog(log) {
        let shouldScrollDown = logsRef.current.scrollTop + height === logsRef.current.scrollHeight

        setLogs(logs => [...logs, log])
        if (shouldScrollDown) logsRef.current.scrollTop = logsRef.current.scrollHeight
    }

    useEffect(() => {
        socket.on('playerJoinRoom', ({ player }) => {
            addLog(`${player?.username} has joined the room`)
        })
        socket.on('playerLeaveRoom', ({ playerId, username }) => {
            addLog(`${username} has left the room`)
        })
        const playerWinHandler = ({ playerId, username }) => {
            addLog(`${username} has win the game`)
        }
        socket.on('playerWin', playerWinHandler)
        const startGameHandler = () => {
            addLog(`Game has started!`)
        }
        socket.on('startGame', startGameHandler)
        return () => {
            socket.off('playerJoinRoom')
            socket.off('playerLeaveRoom')
            socket.off('playerWin', playerWinHandler)
            socket.off('startGame', startGameHandler)
        }
    })
    return (
        <Box ref={logsRef} my={2} overflowY='scroll' h={height}>
            {logs.map((log, i) => <Text key={i}>{log}</Text>)}
        </Box>
    )
}

function EloText() {
    const defaultData = { win: 0, draw: 0, lose: 0 }
    const [display, setDisplay] = useState(false)
    const [data, setData] = useState(defaultData)
    const socket = useSocket()
    useEffect(() => {
        socket.on('eloPreview', ({ win, draw, lose }) => {
            setDisplay(true)
            setData({ win, draw, lose })
        })
        const roomPlayersChangedHandler = ({ players }) => {
            if (players.length === 1) {
                setDisplay(false)
                setData(defaultData)
            }
        }
        socket.on('roomPlayersChanged', roomPlayersChangedHandler)
        return () => {
            socket.off('eloPreview')
            socket.off('roomPlayersChanged', roomPlayersChangedHandler)
        }
    })
    return (
        <>
            {
                display ?
                    <Text>
                        win {formatNumberWithSign(data.win)} / draw {formatNumberWithSign(data.draw)} / lose {formatNumberWithSign(data.lose)}
                    </ Text > :
                    <Text>
                        ?
                    </Text>
            }
        </>
    )
}

export default function Room({ roomId }) {
    const [isPlaying, setPlaying] = useState(false)
    const [isMyTurn, setMyTurn] = useState(false)
    const [stone, setStone] = useState(null)
    const player = useAuthStore(s => s.player)
    const fetchCurrentUser = useAuthStore(s => s.fetchCurrentUser)
    const socket = useContext(SocketContext)
    const { _id: playerId } = player || {}
    const [players, setPlayers] = useState([])
    const [ready, setReady] = useState(false)
    const isHost = players[0]?._id === playerId

    useEffect(() => {
        const roomPlayersChangedHandler = ({ players }) => {
            setPlayers(players)
            if (players.length === 1) setReady(false)
        }
        socket.on('roomPlayersChanged', roomPlayersChangedHandler)
        socket.on('ready', () => {
            setReady(true)
        })

        socket.on('notReady', () => {
            setReady(false)
        })

        socket.on('yourTurn', () => {
            console.log('my turn')
            setMyTurn(true)
        })

        const startGameHandler = ({ stone }) => {
            setPlaying(true)
            setStone(stone)
        }
        socket.on('startGame', startGameHandler)

        const playerWinHandler = async ({ playerId, username }) => {
            setPlaying(false)
            setStone(null)
            setMyTurn(false)
            setReady(false)
            await fetchCurrentUser()
        }
        socket.on('playerWin', playerWinHandler)

        return () => {
            socket.off('roomPlayersChanged', roomPlayersChangedHandler)
            socket.off('yourTurn')
            socket.off('ready')
            socket.off('notReady')
            socket.off('playerWin', playerWinHandler)
            socket.off('startGame', startGameHandler)
            console.log('Room unmounted')
        }
    }, [])


    function leaveRoom() {
        socket.emit('leaveRoom', { playerId, roomId })
        setStone(E)
        setPlaying(false)
    }

    function startGame() {
        socket.emit('startGame', { roomId })
    }

    function changeReadyState() {
        socket.emit(ready ? 'notReady' : 'ready', { roomId })
    }

    return (
        <Flex direction='column' mb={8}>
            <Flex align='center' mb={8}>
                <Text fontWeight={600} fontSize='2xl'> Room #{roomId}</Text>
                <Box ml='auto' >
                    {
                        !isPlaying &&
                        (isHost ?
                            <Button onClick={startGame} isDisabled={!ready} _focus={{ boxShadow: 'none' }} colorScheme='pink'>Start game</Button> :
                            <Button w='100px' onClick={changeReadyState} _focus={{ boxShadow: 'none' }} colorScheme={ready ? 'blackAlpha' : 'pink'}>{ready ? 'Not ready' : 'Ready'}</Button>
                        )
                    }
                    <Button onClick={leaveRoom} _focus={{ boxShadow: 'none' }} colorScheme='gray' ml={2}>Leave room</Button>
                </Box>
            </Flex>
            <SimpleGrid columns={4}>
                <GridItem colSpan={[4, null, null, 3]}>
                    <Board isMyTurn={isMyTurn} onMove={() => setMyTurn(false)} roomId={roomId} stone={stone} isPlaying={isPlaying} />
                </GridItem>
                <GridItem colSpan={[4, null, null, 1]}>
                    <PlayerPanel isPlaying={isPlaying} isMyTurn={isMyTurn} isMe={players[0]?._id === playerId} player={players[0]} myStone={stone} isHost />
                    <PlayerPanel isPlaying={isPlaying} isMyTurn={isMyTurn} isMe={players[1]?._id === playerId} player={players[1]} myStone={stone} ready={ready} />
                    <Text fontWeight={600} fontSize='2xl' my={2}>ELO</Text>
                    <EloText />
                    <Text fontWeight={600} fontSize='2xl' my={2}>Activity</Text>
                    <ActivityLog />
                </GridItem>
            </SimpleGrid>
        </Flex>
    )
}