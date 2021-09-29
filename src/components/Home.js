import { Flex, Text } from "@chakra-ui/layout";
import { Box } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import SocketContext from "../context/SocketContext";
import useAuthStore from "../stores/useAuthStore";
import Form from "./Form";
import Lobby from "./Lobby";

export default function Home() {
    const player = useAuthStore(s => s.player)
    return (
        <Flex direction='column' align='center' w='100%'>
            <Box my={4}>
                <Text fontSize='7xl' align='center' fontWeight={700}>Gomoku Online</Text>
            </Box>
            <Flex align='center' direction='column' h='700px' w='100%'>
                {player ? <Lobby /> : <Form />}
            </Flex>
        </Flex>
    )
}