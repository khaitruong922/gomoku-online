import { Avatar } from "@chakra-ui/avatar"
import { Button } from "@chakra-ui/button"
import Icon from "@chakra-ui/icon"
import { Box, Flex, GridItem, SimpleGrid, Text } from "@chakra-ui/layout"
import { useContext, useEffect, useRef, useState } from "react"
import { FaCheckCircle, FaCrown } from "react-icons/fa"
import SocketContext from "../context/SocketContext"
import useAuthStore from "../stores/useAuthStore"
import buildPlayerString from "../util/buildPlayerString"
import { formatNumberWithSign } from "../util/formatNumberWithSign"
import Board, { E } from "./game/Board"

function PlayerPanel({ player, isHost = false, ready = false }) {
    return (
        <Flex my={2} p={4} align='center' boxShadow='md'>
            <Avatar boxSize='50px' mr={3} />
            <Text mr={3} fontSize='lg'>{player ? buildPlayerString(player) : 'waiting for player...'}</Text>
            {isHost && <Icon boxSize='20px' as={FaCrown} color='yellow.400' />}
            {!isHost && <Icon boxSize='20px' as={FaCheckCircle} color={ready ? 'green.500' : 'blackAlpha.500'} />}
        </Flex>
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
        const startGameHandler = () => {
            addLog(`Game has started!`)
        }
        socket.on('startGame', startGameHandler)
        return () => {
            socket.off('playerJoinRoom')
            socket.off('playerLeaveRoom')
            socket.off('startGame', startGameHandler)
        }
    })
    return (
        <Box ref={logsRef} my={2} overflowY='scroll' h={height}>
            {logs.map((log, i) => <Text key={i}>{log}</Text>)}
        </Box>
    )
}

export default function Room({ roomId }) {
    const [isPlaying, setPlaying] = useState(false)
    const [stone, setStone] = useState(E)
    const player = useAuthStore(s => s.player)
    const socket = useContext(SocketContext)
    const { _id: playerId } = player || {}
    const [players, setPlayers] = useState([])
    const [ready, setReady] = useState(false)
    const isHost = players[0]?._id === playerId

    useEffect(() => {
        socket.on('roomPlayersChanged', ({ players }) => {
            setPlayers(players)
            if (players.length === 1) setReady(false)
        })

        socket.on('ready', () => {
            setReady(true)
        })

        socket.on('notReady', () => {
            setReady(false)
        })
        const startGameHandler = ({ stone }) => {
            setPlaying(true)
            setStone(stone)
        }
        socket.on('startGame', startGameHandler)

        return () => {
            socket.off('roomPlayerChanged')
            socket.off('ready')
            socket.off('notReady')
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
                    <Board roomId={roomId} stone={stone} isPlaying={isPlaying} />
                </GridItem>
                <GridItem colSpan={[4, null, null, 1]}>
                    <Text fontWeight={600} fontSize='2xl' mb={2}>Player 1</Text>
                    <PlayerPanel player={players[0]} isHost />
                    <Text fontWeight={600} fontSize='2xl' my={2}>Player 2</Text>
                    <PlayerPanel player={players[1]} ready={ready} />
                    <Text fontWeight={600} fontSize='2xl' my={2}>ELO</Text>
                    <Text>
                        win {formatNumberWithSign(10)} / draw {formatNumberWithSign(0)} / lose {formatNumberWithSign(-10)}
                    </Text>
                    <Text fontWeight={600} fontSize='2xl' my={2}>Activity</Text>
                    <ActivityLog />
                </GridItem>
            </SimpleGrid>
        </Flex>
    )
}