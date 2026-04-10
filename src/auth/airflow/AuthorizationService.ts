/**
 * @fileoverview Airflow JWT authorization service.
 *
 * Authenticates against the Airflow API using username/password credentials
 * sourced from environment variables and returns a JWT access token.
 *
 * Required environment variables:
 * - `VITE_AIRFLOW_USERNAME` – Airflow service account username
 * - `VITE_AIRFLOW_PASSWORD` – Airflow service account password
 *
 * @module auth/airflow/AuthorizationService
 */

import axios from "axios"

/**
 * Retrieves a JWT access token from the Airflow authentication endpoint.
 *
 * Posts username/password credentials to `/auth/token` and returns the
 * `access_token` from the response.
 *
 * @returns {Promise<string>} Resolves to the JWT access token string.
 * @throws {Error} If the HTTP request fails or the response is malformed.
 */
export const getAirflowJWT = async (): Promise<string> => {
    const response = await axios.post("/auth/token", {
        username: import.meta.env.VITE_AIRFLOW_USERNAME,
        password: import.meta.env.VITE_AIRFLOW_PASSWORD
    });
    return response.data.access_token;
}
