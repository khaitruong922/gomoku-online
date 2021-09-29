import { Button } from "@chakra-ui/button"
import { Box, Flex, Text } from "@chakra-ui/layout"
import { useContext, useEffect } from "react"
import SocketContext from "../context/SocketContext"
import useAuthStore from "../stores/useAuthStore"

export default function Room({ roomId }) {
    const player = useAuthStore(s => s.player)
    const socket = useContext(SocketContext)
    useEffect(() => {

    }, [])
    function leaveRoom() {
        socket.emit('leaveRoom', { player, roomId })
    }

    return (
        <Box>
            <Flex>
                <Text>  Room #{roomId}</Text>
                <Button onClick={leaveRoom} colorScheme='gray'>Leave room </Button>
            </Flex>
        </Box>
    )
}