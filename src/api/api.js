import axios from 'axios'
import { apiEndpoint } from '../constants/endpoint'

const api = axios.create({
    withCredentials: true,
    baseURL: apiEndpoint,
})

export default api