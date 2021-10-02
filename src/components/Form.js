import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup } from "@chakra-ui/input";
import { Box, Divider, Flex, SimpleGrid, Text } from "@chakra-ui/layout";
import { useState } from "react";
import api from "../api/api";
import useInput from "../hooks/useInput";
import { useErrorToast, useSuccessToast } from "../shared/toast";
import useAuthStore from "../stores/useAuthStore";

function LoginForm() {
    const { value: username, onInput: onUsernameInput } = useInput('')
    const { value: password, onInput: onPasswordInput } = useInput('')
    const errorToast = useErrorToast()
    const login = useAuthStore(s => s.login)
    const fetchCurrentUser = useAuthStore(s => s.fetchCurrentUser)
    const [submitting, setSubmitting] = useState(false)

    const onFormSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        const token = await login({ username, password })
        if (!token) {
            errorToast({
                title: 'Login failed',
                description: 'Username and password do not match.',
            })
            setSubmitting(false)
            return
        }
        const user = await fetchCurrentUser()
        if (!user) {
            errorToast({
                title: 'Cannot fetch user',
                description: 'Please enable cookie to login.',
            })
            setSubmitting(false)
            return
        }
    }

    return (
        <form onSubmit={onFormSubmit}>
            <Text mb={2} align='center' fontSize='3xl' fontWeight={600}>Login</Text>
            <FormControl isRequired id='login-username' mb={2}>
                <FormLabel>Username</FormLabel>
                <Input value={username} onInput={onUsernameInput} />
            </FormControl>
            <FormControl isRequired id='login-password' mb={2}>
                <FormLabel>Password</FormLabel>
                <Input value={password} onInput={onPasswordInput} type='password' />
            </FormControl>
            <Button type='submit' isLoading={submitting} isFullWidth mt={2} colorScheme='pink'>Login</Button>
        </form>
    )
}

function RegisterForm() {
    const { value: username, onInput: onUsernameInput } = useInput('')
    const { value: password, onInput: onPasswordInput } = useInput('')
    const { value: confirmPassword, onInput: onConfirmPasswordInput } = useInput('')
    const errorToast = useErrorToast()
    const successToast = useSuccessToast()
    const [submitting, setSubmitting] = useState(false)

    const onFormSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            errorToast({
                title: 'Password do not match',
            })
            return
        }
        setSubmitting(true)
        try {
            await api.post('/users', { username, password })
            successToast({
                title: 'Register account successfully',
            })
        }
        catch (e) {
            errorToast({
                title: 'Register failed',
                description: e.response?.data?.message,
            })
        }
        finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={onFormSubmit}>
            <Text mb={2} align='center' fontSize='3xl' fontWeight={600}>Register</Text>
            <FormControl isRequired id='register-username' mb={2}>
                <FormLabel>Username</FormLabel>
                <Input value={username} onInput={onUsernameInput} />
            </FormControl>
            <FormControl isRequired id='register-password' mb={2}>
                <FormLabel>Password</FormLabel>
                <Input value={password} onInput={onPasswordInput} type='password' />
            </FormControl>
            <FormControl isRequired id='register-cpassword' mb={2}>
                <FormLabel>Confirm password</FormLabel>
                <Input value={confirmPassword} onInput={onConfirmPasswordInput} type='password' />
            </FormControl>
            <Button type='submit' isLoading={submitting} isFullWidth mt={2} colorScheme='pink'>Register</Button>
        </form >
    )
}

export default function Form() {
    return (
        <SimpleGrid mx='auto' p={4} w={['100%', null, '75%', '50%']} spacing={8} columns={[1, 1, 2, 2]}>
            <LoginForm />
            <RegisterForm />
        </SimpleGrid>
    )
}