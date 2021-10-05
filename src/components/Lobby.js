import { Button } from "@chakra-ui/button";
import { Box, Flex, GridItem, SimpleGrid, Text } from "@chakra-ui/layout";
import { chakra } from "@chakra-ui/system";
import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { socketEndpoint } from "../constants/endpoint";
import SocketContext from "../context/SocketContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useErrorToast } from "../shared/toast";
import useAuthStore from "../stores/useAuthStore";
import getArrayEntries from "../util/getArrayEntries";
import ForceDisconnectPage from "./ForceDisconnectPage";
import Room from "./Room";
import RoomCard from "./RoomCard";


function RoomList() {
    const [rooms, setRooms] = useState([])
    const socket = useContext(SocketContext)
    useEffect(() => {
        socket.emit('requestRooms')
        socket.on('roomsChanged', ({ rooms }) => {
            setRooms(getArrayEntries(rooms))
        })
        return () => {
            socket.off('roomsChanged')
        }
    }, [socket])


    return (
        <>
            <Text fontSize='2xl' mb={2} fontWeight={600}>Rooms ({rooms.length})</Text>
            <Box height='600px' overflowY='auto' px={4}>
                {rooms.map(room => <RoomCard key={room.id} room={room} />)}
            </Box>
        </>
    )
}

function PlayerList() {
    const [players, setPlayers] = useState([])
    const socket = useContext(SocketContext)
    useEffect(() => {
        socket.emit('requestPlayers')
        socket.on('playersChanged', ({ players }) => {
            setPlayers(getArrayEntries(players))
        })
        return () => {
            socket.off('playersChanged')
        }
    }, [socket])

    return (
        <>
            <Text fontSize='2xl' mb={2} fontWeight={600}>Online players ({players.length})</Text>
            <Box height='600px' overflowY='auto'>
                {players.map(player => <Text key={player._id}>{player.username} ({player.elo})</Text>)}
            </Box>
        </>
    )
}


export default function Lobby() {
    const [roomId, setRoomId] = useState(null)
    const player = useAuthStore(s => s.player)
    const { _id: playerId, elo, username } = player || {}
    const logout = useAuthStore(s => s.logout)
    const [forceDisconnected, setForceDisconnected] = useState(false)
    const [hasJoinLobby, setJoinLobby] = useState(false)
    const errorToast = useErrorToast()
    const [socket, setSocket] = useState(null)
    useEffect(() => {
        let unmounted = true
        if (socket === null) {
            const _socket = io(socketEndpoint)
            setSocket(_socket)
            unmounted = false
            return
        }
        socket.on('connect', () => {
            socket.emit('requestJoinLobby', ({ playerId }))
            socket.on('forceDisconnect', () => {
                setForceDisconnected(true)
                socket.disconnect()
            })
            socket.on('joinLobby', () => {
                setJoinLobby(true)
                socket.on('joinRoom', ({ roomId }) => {
                    console.log(`join room ${roomId}`)
                    setRoomId(roomId)
                })
                socket.on('leaveRoom', () => {
                    setRoomId(null)
                })
                socket.on('joinRoomFailed', ({ message }) => {
                    errorToast({ title: 'Join room failed', description: message })
                })
            })

        })
        return () => {
            if (unmounted) socket.disconnect()
        }
    }, [socket])

    function createRoom() {
        socket.emit('createRoom', { playerId })
    }

    return (
        <SocketContext.Provider value={socket}>
            <Flex direction='column' w='80%' mx='auto' h='100%'>
                {
                    forceDisconnected ? <ForceDisconnectPage /> :
                        !hasJoinLobby ? <LoadingSpinner /> :
                            roomId !== null ? <Room roomId={roomId} /> :
                                <>
                                    <Flex align='center'>
                                        <Box>
                                            <Text fontSize='xl' mr={2}>Welcome, {username}!</Text>
                                            <Text fontSize='xl' mr={2}><chakra.span fontWeight={600}>ELO:</chakra.span> {elo}</Text>
                                        </Box>
                                        <Box ml='auto'>
                                            <Button type='button' onClick={createRoom} mr={2} _focus={{ boxShadow: 'none' }} border colorScheme='pink'>Create room</Button>
                                            <Button type='button' onClick={logout} mr={2} _focus={{ boxShadow: 'none' }} border colorScheme='gray'>Log out</Button>
                                        </Box>
                                    </Flex>
                                    <SimpleGrid columns={2} spacing={4} mt={4}>
                                        <GridItem>
                                            <Box>
                                                <RoomList />
                                            </Box>
                                        </GridItem>
                                        <GridItem>
                                            <Box>
                                                <PlayerList />
                                            </Box>
                                        </GridItem>
                                    </SimpleGrid>
                                </>
                }
            </Flex>
        </SocketContext.Provider>

    )
}