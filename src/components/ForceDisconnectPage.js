import { Box, Link, Text } from "@chakra-ui/layout";

export default function ForceDisconnectPage() {
    return (
        <Box>
            <Text mb={2} align='center' fontSize='lg'>You are logged in at another location. You will be disconnected from the server</Text>
            <Text align='center' fontSize='xl'><Link color='pink.400' textDecoration='none' onClick={() => window.location.reload()}>Reload</Link> page to try again</Text>
        </Box>
    )
}