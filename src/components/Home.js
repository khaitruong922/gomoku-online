import { Flex, Text } from '@chakra-ui/layout'
import { Box } from '@chakra-ui/react'
import useAuthStore from '../stores/useAuthStore'
import Form from './Form'
import Lobby from './Lobby'

export default function Home() {
	const player = useAuthStore((s) => s.player)
	return (
		<Flex h="100%" direction={'column'} w="100%">
			<Box bgColor={'pink.100'} py={4}>
				<Text fontSize="5xl" align="center" fontWeight={700}>
					Gomoku Online
				</Text>
			</Box>
			<Box flex={1}>{player ? <Lobby /> : <Form />}</Box>
		</Flex>
	)
}
