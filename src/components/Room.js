import { Avatar } from '@chakra-ui/avatar'
import { Button } from '@chakra-ui/button'
import Icon from '@chakra-ui/icon'
import { Box, Flex, GridItem, SimpleGrid, Text } from '@chakra-ui/layout'
import { Progress } from '@chakra-ui/react'
import { useContext, useEffect, useRef, useState } from 'react'
import { FaCheckCircle, FaCrown } from 'react-icons/fa'
import SocketContext, { useSocket } from '../context/SocketContext'
import useAuthStore from '../stores/useAuthStore'
import buildPlayerString from '../util/buildPlayerString'
import { formatNumberWithSign } from '../util/formatNumberWithSign'
import Board, { E, O, X } from './game/Board'
import useCountdown from '../hooks/useCountdown'
import CountdownContext, {
	useCountdownContext,
} from '../context/CountdownContext'

function TimeIndicator({ playerId, isCurrentPlayer }) {
	const socket = useSocket()
	const { percentage } = useCountdownContext()
	useEffect(() => {
		return () => {
			console.log('timer unmounted')
		}
	}, [socket, playerId])
	return (
		<Progress
			value={isCurrentPlayer ? percentage : 0}
			size="sm"
			colorScheme="pink"
		/>
	)
}

function PlayerPanel({
	player,
	isPlaying,
	myStone,
	isHost = false,
	isMyTurn,
	isMe,
	ready = false,
}) {
	const { _id: playerId } = player || {}
	const isCurrentPlayer = (isMyTurn && isMe) || (!isMyTurn && !isMe)
	const stone =
		(myStone === X && isMe) || (myStone === O && !isMe)
			? X
			: (myStone === O && isMe) || (myStone === X && !isMe)
			? O
			: E
	return (
		<Box w="100%">
			<Text
				fontWeight={600}
				color={isPlaying && isCurrentPlayer ? 'pink.400' : 'black'}
				fontSize="xl"
				align={'right'}
				my={2}
			>
				Player {isHost ? 1 : 2} {stone ? `(${stone})` : ''}
			</Text>
			<TimeIndicator playerId={playerId} isCurrentPlayer={isCurrentPlayer} />
			<Flex my={2} p={4} align="center" boxShadow="md">
				<Avatar boxSize="50px" mr={3} />
				<Text mr={3} fontSize="lg" fontWeight={500}>
					{player ? buildPlayerString(player) : 'waiting for player...'}
				</Text>
				{isHost && <Icon boxSize="20px" as={FaCrown} color="yellow.400" />}
				{!isHost && (
					<Icon
						boxSize="20px"
						as={FaCheckCircle}
						color={ready ? 'green.500' : 'blackAlpha.500'}
					/>
				)}
			</Flex>
		</Box>
	)
}

function ActivityLog() {
	const height = 200
	const logsRef = useRef(null)
	const socket = useContext(SocketContext)

	const [logs, setLogs] = useState([])

	function addLog(log) {
		let shouldScrollDown =
			logsRef.current.scrollTop + height === logsRef.current.scrollHeight

		setLogs((logs) => [...logs, log])
		if (shouldScrollDown)
			logsRef.current.scrollTop = logsRef.current.scrollHeight
	}

	useEffect(() => {
		const playerJoinRoomHandler = ({ player }) => {
			addLog(`${player?.username} has joined the room`)
		}

		const playerLeaveRoomHandler = ({ playerId, username }) => {
			addLog(`${username} has left the room`)
		}
		const playerWinHandler = ({ playerId, username }) => {
			addLog(`${username} has win the game`)
		}
		const startGameHandler = () => {
			addLog(`Game has started!`)
		}

		socket.on('playerJoinRoom', playerJoinRoomHandler)
		socket.on('playerLeaveRoom', playerLeaveRoomHandler)
		socket.on('playerWin', playerWinHandler)
		socket.on('startGame', startGameHandler)
		return () => {
			socket.off('playerJoinRoom', playerJoinRoomHandler)
			socket.off('playerLeaveRoom', playerLeaveRoomHandler)
			socket.off('playerWin', playerWinHandler)
			socket.off('startGame', startGameHandler)
		}
	})
	return (
		<Box pr={2} ref={logsRef} overflowY="scroll" h={height}>
			{logs.map((log, i) => (
				<Text key={i}>{log}</Text>
			))}
		</Box>
	)
}

function EloText() {
	const defaultData = { win: 0, draw: 0, lose: 0 }
	const [display, setDisplay] = useState(false)
	const [data, setData] = useState(defaultData)
	const socket = useSocket()
	useEffect(() => {
		const eloPreviewHandler = ({ win, draw, lose }) => {
			setDisplay(true)
			setData({ win, draw, lose })
		}
		const roomPlayersChangedHandler = ({ players }) => {
			if (players.length === 1) {
				setDisplay(false)
				setData(defaultData)
			}
		}

		socket.on('eloPreview', eloPreviewHandler)
		socket.on('roomPlayersChanged', roomPlayersChangedHandler)
		return () => {
			socket.off('eloPreview', eloPreviewHandler)
			socket.off('roomPlayersChanged', roomPlayersChangedHandler)
		}
	})
	return (
		<>
			{display ? (
				<Text>
					win {formatNumberWithSign(data.win)} / draw{' '}
					{formatNumberWithSign(data.draw)} / lose{' '}
					{formatNumberWithSign(data.lose)}
				</Text>
			) : (
				<Text>?</Text>
			)}
		</>
	)
}

export default function Room({ roomId }) {
	const [isPlaying, setPlaying] = useState(false)
	const [isMyTurn, setMyTurn] = useState(false)
	const [stone, setStone] = useState(null)
	const player = useAuthStore((s) => s.player)
	const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser)
	const socket = useContext(SocketContext)
	const { _id: playerId } = player || {}
	const [players, setPlayers] = useState([])
	const [ready, setReady] = useState(false)
	const isHost = players[0]?._id === playerId
	const countdown = useCountdown({ initialTotalSec: 1 })
	const { sec, reset, setToZero } = countdown

	useEffect(() => {
		const roomPlayersChangedHandler = ({ players }) => {
			setPlayers(players)
			console.log(players)
			if (players.length === 1) setReady(false)
		}
		const readyHandler = () => {
			setReady(true)
		}

		const notReadyHandler = () => {
			setReady(false)
		}

		const passTurnHandler = ({ playerId: currentTurn, duration }) => {
			console.log('my turn')
			setMyTurn(playerId === currentTurn ? true : false)
			reset(duration)
		}

		const startGameHandler = ({ xPlayer }) => {
			setPlaying(true)
			setStone(playerId === xPlayer ? X : O)
		}

		const playerWinHandler = async ({}) => {
			setPlaying(false)
			setStone(null)
			setMyTurn(false)
			setReady(false)
			setToZero()
			await fetchCurrentUser()
		}

		socket.on('roomPlayersChanged', roomPlayersChangedHandler)
		socket.on('ready', readyHandler)
		socket.on('notReady', notReadyHandler)
		socket.on('passTurn', passTurnHandler)
		socket.on('startGame', startGameHandler)
		socket.on('playerWin', playerWinHandler)

		return () => {
			socket.off('roomPlayersChanged', roomPlayersChangedHandler)
			socket.off('passTurn', passTurnHandler)
			socket.off('ready', readyHandler)
			socket.off('notReady', notReadyHandler)
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
		<CountdownContext.Provider value={countdown}>
			<Flex direction="column" h="100%">
				<SimpleGrid columns={4} spacing={2} h="100%">
					<GridItem
						display="flex"
						justifyContent={['flex-start']}
						alignItems={['center']}
						colSpan={[4, null, null, null, 3]}
					>
						<Board
							sec={sec}
							isMyTurn={isMyTurn}
							onMove={() => setMyTurn(false)}
							roomId={roomId}
							stone={stone}
							isPlaying={isPlaying}
						/>
					</GridItem>
					<GridItem
						colSpan={[4, null, null, null, 1]}
						display={'flex'}
						flexDir={'column'}
						justifyContent={'center'}
						alignItems={'flex-end'}
					>
						<Text fontWeight={600} fontSize="2xl">
							{' '}
							Room #{roomId}
						</Text>
						<Flex align="center" my={2}>
							{!isPlaying &&
								(isHost ? (
									<Button
										onClick={startGame}
										isDisabled={!ready}
										_focus={{ boxShadow: 'none' }}
										colorScheme="pink"
									>
										Start game
									</Button>
								) : (
									<Button
										w="100px"
										onClick={changeReadyState}
										_focus={{ boxShadow: 'none' }}
										colorScheme={ready ? 'blackAlpha' : 'pink'}
									>
										{ready ? 'Not ready' : 'Ready'}
									</Button>
								))}
							<Button
								onClick={leaveRoom}
								_focus={{ boxShadow: 'none' }}
								colorScheme="gray"
								ml={2}
							>
								Leave room
							</Button>
						</Flex>

						<PlayerPanel
							isPlaying={isPlaying}
							isMyTurn={isMyTurn}
							isMe={players[0]?._id === playerId}
							player={players[0]}
							myStone={stone}
							isHost
						/>
						<PlayerPanel
							isPlaying={isPlaying}
							isMyTurn={isMyTurn}
							isMe={players[1]?._id === playerId}
							player={players[1]}
							myStone={stone}
							ready={ready}
						/>
						<Text fontWeight={600} fontSize="xl" my={2}>
							ELO
						</Text>
						<EloText />
						<Text fontWeight={600} fontSize="xl" my={2}>
							Activity
						</Text>
						<ActivityLog />
					</GridItem>
				</SimpleGrid>
			</Flex>
		</CountdownContext.Provider>
	)
}
