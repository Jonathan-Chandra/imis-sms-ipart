/**
 * @fileoverview OAuth2 password-grant authorization for local development.
 *
 * Credentials and the token endpoint are read from environment variables so
 * that nothing sensitive is hard-coded in source.
 *
 * Required environment variables:
 * - `VITE_AUTH_URL`      – OAuth2 token endpoint
 * - `VITE_AUTH_USERNAME` – Service account username
 * - `VITE_AUTH_PASSWORD` – Service account password
 *
 * @module auth/imis/LocalAuthorization
 */

import type { IAuthorization } from "./IAuthorization";
import axios from "axios";

/**
 * Authorization strategy used in local development environments.
 *
 * Fetches a bearer token from the configured OAuth2 endpoint using the
 * resource-owner password-credentials grant (`grant_type=password`).
 *
 * @implements {IAuthorization}
 */
export class LocalAuthorization implements IAuthorization {

    /**
     * Returns a bearer token for authenticating iMIS API requests.
     *
     * @returns {Promise<string>} Resolves to the `access_token` string.
     * @throws {Error} If the token request fails or returns a non-200 status.
     */
    async getToken(): Promise<string> {
        const token = await this.getBearerToken();
        return token;
    }

    /**
     * Performs the OAuth2 password-grant POST and extracts the access token.
     *
     * @returns {Promise<string>} The raw access token string.
     * @throws {Error} If the HTTP response status is not 200.
     * @private
     */
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
