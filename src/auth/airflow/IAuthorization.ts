/**
 * @fileoverview Credentials interface for Airflow authentication.
 * @module auth/airflow/IAuthorization
 */

/**
 * Represents the credentials required to authenticate against the Airflow API.
 *
 * @interface
 */
export interface IAuthorization {
    /** Airflow service account username. */
    username: string,
    /** Airflow service account password. */
    password: string
}
