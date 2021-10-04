import { Flex, Text } from "@chakra-ui/layout";
import { CELL_SIZE, E, NUM_COL } from "./Board";

export default function Cell({ r, c, stone, clickable, onClick }) {
    const i = r * NUM_COL + c
    return (
        <Flex justify='center' align='center' cursor={clickable ? 'pointer' : 'auto'} onClick={onClick} h={`${CELL_SIZE}px`} bgColor={i % 2 === 0 ? 'gray.100' : 'pink.100'} >
            <Text className='user-select-none' fontSize='xl' fontWeight={700} color='pink.500'>{stone}</Text>
        </Flex>
    )
}