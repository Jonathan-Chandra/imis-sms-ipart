/**
 * @fileoverview JWT response shape returned by the Airflow auth endpoint.
 * @module auth/airflow/IJWT
 */

/**
 * Represents the JSON Web Token response from the Airflow `/auth/token` endpoint.
 *
 * @interface
 */
export interface IJWT {
    /** The JWT access token string used to authenticate Airflow API requests. */
    access_token: string
}
