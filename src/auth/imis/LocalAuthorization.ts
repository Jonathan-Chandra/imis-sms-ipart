import type { IAuthorization } from "./IAuthorization";
import axios from "axios";

export class LocalAuthorization implements IAuthorization {
    async getToken(): Promise<string> {
        const token = await this.getBearerToken();
        return token;
    }

    private async getBearerToken(): Promise<string> {
        console.log('AUTH URL:', import.meta.env.VITE_AUTH_URL);
        const username: string = import.meta.env.VITE_AUTH_USERNAME;
        const password: string = import.meta.env.VITE_AUTH_PASSWORD;
        const response = await axios.post(`${import.meta.env.VITE_AUTH_URL}`,new URLSearchParams({
            "grant_type": "password",
            "username": username,
            "password": password
        }), 
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        if(response.status === 200) {
            return response.data.access_token;
        } else {
            throw new Error("Failed to retrieve access token");
        }

    }
}
