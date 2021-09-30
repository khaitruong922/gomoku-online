import { Avatar } from "@chakra-ui/avatar"
import { Button } from "@chakra-ui/button"
import { Box, Flex, GridItem, SimpleGrid, Text } from "@chakra-ui/layout"
import { useContext, useEffect, useRef, useState } from "react"
import SocketContext from "../context/SocketContext"
import useAuthStore from "../stores/useAuthStore"
import buildPlayerString from "../util/buildPlayerString"

function PlayerPanel({ player }) {
    return (
        <Flex my={4} p={4} align='center' boxShadow='md'>

            <Avatar boxSize='50px' mr={2} />
            <Text fontSize='lg'>{player ? buildPlayerString(player) : 'Waiting for player...'}</Text>
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
        console.log(logsRef.current.scrollTop)
        console.log(logsRef.current.scrollHeight)

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
        return () => {
            socket.off('playerJoinRoom')
            socket.off('playerLeaveRoom')
        }
    })
    return (
        <Box ref={logsRef} my={4} overflowY='scroll' h={height}>
            {logs.map((log, i) => <Text key={i}>{log}</Text>)}
        </Box>
    )
}

export default function Room({ roomId }) {
    const player = useAuthStore(s => s.player)
    const socket = useContext(SocketContext)
    const [players, setPlayers] = useState([])

    useEffect(() => {
        socket.on('roomPlayersChanged', ({ players }) => {
            setPlayers(players)
        })

        return () => {

            socket.off('roomPlayerChanged')
        }
    }, [])
    function leaveRoom() {
        socket.emit('leaveRoom', { playerId: player._id, roomId })
    }

    return (
        <Flex direction='column'>
            <Flex align='center'>
                <Text fontWeight={600} fontSize='2xl'> Room #{roomId}</Text>
                <Button ml='auto' onClick={leaveRoom} colorScheme='gray'>Leave room </Button>
            </Flex>
            <SimpleGrid columns={4}>
                <GridItem colSpan={3}>
                    <Flex align='center' justify='center'>
                        <Text>Game</Text>
                    </Flex>
                </GridItem>
                <GridItem colSpan={1}>
                    <Text fontWeight={600} fontSize='2xl'>Player 1 (host)</Text>
                    <PlayerPanel player={players[0]} />
                    <Text fontWeight={600} fontSize='2xl'>Player 2</Text>
                    <PlayerPanel player={players[1]} />
                    <Text fontWeight={600} fontSize='2xl'>Activity</Text>
                    <ActivityLog />
                </GridItem>
            </SimpleGrid>
        </Flex>
    )
}