import { Button } from "@chakra-ui/button";
import { Box, Flex, GridItem, SimpleGrid, Text } from "@chakra-ui/layout";
import { useCallback, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { socketEndpoint } from "../constants/endpoint";
import SocketContext from "../context/SocketContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useErrorToast } from "../shared/toast";
import useAuthStore from "../stores/useAuthStore";
import getArrayEntries from "../util/getArrayEntries";
import Room from "./Room";
import RoomCard from "./RoomCard";


function RoomList() {
    const [rooms, setRooms] = useState([])
    const socket = useContext(SocketContext)
    useEffect(() => {
        socket.emit('requestRooms')
        socket.on('roomsChanged', ({ rooms }) => {
            setRooms(getArrayEntries(rooms))
            console.log('roomsChanged')
            console.log(rooms)
        })
        return () => {
            socket.off('roomsChanged')
        }
    }, [])

    return (
        <>
            <Text fontSize='2xl' mb={2} fontWeight={600}>Rooms ({rooms.length})</Text>
            {rooms.map(room => <RoomCard key={room.id} room={room} />)}
        </>
    )
}
export default function Lobby() {
    const [roomId, setRoomId] = useState(null)
    const player = useAuthStore(s => s.player)
    const logout = useAuthStore(s => s.logout)
    const [loading, setLoading] = useState(true)
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
            setLoading(false)
            socket.emit('joinLobby', ({ player }))
        })

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
        return () => {
            if (unmounted) socket.disconnect()
        }
    }, [socket])

    const { username } = player || {}

    function createRoom() {
        console.log(player)
        socket.emit('createRoom', { player })
    }

    return (
        <SocketContext.Provider value={socket}>
            <Flex direction='column' w='80%' mx='auto' h='100%'>
                {
                    loading ? <LoadingSpinner /> :
                        roomId !== null ? <Room roomId={roomId} /> :
                            <>
                                <Flex align='center'>
                                    <Text fontSize='xl' mr={2}>Welcome, {username}!</Text>
                                    <Box ml='auto'>
                                        <Button type='button' onClick={createRoom} mr={2} _focus={{ boxShadow: 'none' }} border colorScheme='pink'>Create room</Button>
                                        <Button type='button' onClick={logout} mr={2} _focus={{ boxShadow: 'none' }} border colorScheme='gray'>Log out</Button>
                                    </Box>
                                </Flex>
                                <SimpleGrid columns={2}>
                                    <GridItem>
                                        <Box>
                                            <RoomList />
                                        </Box>
                                    </GridItem>
                                </SimpleGrid>
                            </>
                }
            </Flex>
        </SocketContext.Provider>

    )
}