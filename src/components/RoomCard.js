import { Flex, Text } from "@chakra-ui/layout"
import { useContext } from "react"
import SocketContext from "../context/SocketContext"
import useAuthStore from "../stores/useAuthStore"

export default function RoomCard({ room }) {
    const { id: roomId, players = [] } = room
    const socket = useContext(SocketContext)
    const player = useAuthStore(s => s.player)

    function joinRoom() {
        socket.emit('joinRoom', { player, roomId })
    }

    return (
        <Flex cursor='pointer' onClick={joinRoom} my={2} borderRadius='xl' boxShadow='md' p={4} border='2px' borderColor='pink.400'>
            <Text fontWeight={700} fontSize='xl' mr={2}>#{roomId}</Text>
            <Text fontSize='xl'>{players.length}/2</Text>
        </Flex>
    )
}