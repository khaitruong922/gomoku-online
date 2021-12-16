import { ChakraProvider } from '@chakra-ui/react'
import { useEffect } from 'react'
import Home from './components/Home'
import useAuthStore from './stores/useAuthStore'
import { theme } from './theme'

export default function App() {
	const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser)

	useEffect(() => {
		fetchCurrentUser()
	}, [fetchCurrentUser])

	return (
		<ChakraProvider theme={theme}>
			<Home />
		</ChakraProvider>
	)
}
