/**
 * @fileoverview Authorization interface for iMIS authentication strategies.
 * @module auth/imis/IAuthorization
 */

/**
 * Contract that every iMIS authorization strategy must satisfy.
 *
 * Implementations are responsible for obtaining and returning a valid auth
 * token string, regardless of the underlying mechanism (OAuth2, ASP.NET
 * anti-forgery token, etc.).
 *
 * @interface
 */
export interface IAuthorization {
    /**
     * Resolves to a valid authentication token for the current environment.
     *
     * @returns {Promise<string>} A promise that resolves to the token string.
     * @throws {Error} If the token cannot be retrieved.
     */
    getToken(): Promise<string>;
}
