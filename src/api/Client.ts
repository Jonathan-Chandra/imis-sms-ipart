import axios, { type AxiosInstance } from "axios";
import {CreateAuthorizationService} from "../auth/imis/AuthorizationService";

const authorizationService = CreateAuthorizationService();
const modeIsLocal = import.meta.env.VITE_AUTH_MODE === "local";


const api : AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(async (config) => {
    const token = await authorizationService.getToken();
    if (!token) throw new Error("Failed to retrieve token during API request.");
    if(modeIsLocal) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    else {
        config.headers.set("RequestVerificationToken", token);
    }
    return config;
});

export default api;