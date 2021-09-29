import { useToast } from "@chakra-ui/react"

const createToast = (status) => {
    return () => {
        const toast = useToast()
        return ({ title, description }) => toast(
            {
                position: 'bottom-right',
                isClosable: true,
                duration: 4000,
                status,
                title,
                description,
            }
        )
    }
}

export const useErrorToast = createToast('error')
export const useSuccessToast = createToast('success')
