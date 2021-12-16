import { Flex, Text } from '@chakra-ui/layout'
import { useContext } from 'react'
import SocketContext from '../context/SocketContext'
import useAuthStore from '../stores/useAuthStore'
import buildPlayerString from '../util/buildPlayerString'

export default function RoomCard({ room }) {
	const { id: roomId, players = [] } = room
	const socket = useContext(SocketContext)
	const player = useAuthStore((s) => s.player)
	const { _id: playerId } = player || {}

	function joinRoom() {
		socket.emit('joinRoom', { playerId, roomId })
	}

	return (
		<Flex
			cursor="pointer"
			onClick={joinRoom}
			my={2}
			borderRadius="xl"
			boxShadow="md"
			p={4}
			border="2px"
			borderColor="pink.400"
		>
			<Text flex={1} fontWeight={700} fontSize="xl">
				#{roomId}
			</Text>
			<Text flex={2} fontSize="xl">
				{buildPlayerString(players[0])}
			</Text>
			<Text flex={2} fontSize="xl">
				{buildPlayerString(players[1])}
			</Text>
			<Text flex={1} fontSize="xl" align="right" mr={2}>
				{players.length}/2
			</Text>
		</Flex>
	)
}
