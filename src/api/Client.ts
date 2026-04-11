/**
 * @fileoverview Axios HTTP client pre-configured for the iMIS API.
 *
 * Attaches authentication tokens to every outgoing request via a request
 * interceptor. The token strategy is selected at build time through the
 * `VITE_AUTH_MODE` environment variable:
 *
 * - `"local"` – OAuth2 password-grant bearer token (see {@link LocalAuthorization})
 * - anything else – ASP.NET request-verification token (see {@link CloudAuthorization})
 *
 * @module api/Client
 */

import axios, { type AxiosInstance } from "axios";
import {CreateAuthorizationService} from "../auth/imis/AuthorizationService";

const authorizationService = CreateAuthorizationService();
const modeIsLocal = import.meta.env.VITE_AUTH_MODE === "local";

/**
 * Pre-configured Axios instance targeting the iMIS REST API.
 *
 * Base URL is read from `VITE_API_URL`. All requests are sent as JSON and
 * include the appropriate authentication header before leaving the browser.
 *
 * @example
 * ```ts
 * import api from './api/Client';
 * const res = await api.get('/party');
 * ```
 */
const api : AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

/**
 * Request interceptor that resolves and injects the auth token before each
 * request is dispatched.
 *
 * @throws {Error} If the authorization service fails to return a token.
 */
api.interceptors.request.use(async (config) => {
    const token = await authorizationService.getToken();
    if (!token) throw new Error("Failed to retrieve token during API request.");
    if(modeIsLocal) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    else {
        config.headers.set("RequestVerificationToken", token);
    }

    // Log the full request URL
    const fullUrl = (config.baseURL ?? '') + (config.url ?? '') + (config.params ? '?' + new URLSearchParams(config.params).toString() : '');
    console.log('Axios request URL:', fullUrl);
    console.log('Params:', config.params);

    return config;
});

export default api;
