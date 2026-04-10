/**
 * @fileoverview iMIS OAuth2 token response model.
 * @module models/Token
 */

/**
 * Represents the full token response returned by the iMIS OAuth2 endpoint.
 *
 * @interface
 */
export interface IToken {
    /** The bearer access token used to authenticate API requests. */
    access_token: string;
    /** The token type, typically `"bearer"`. */
    token_type: string;
    /** Token lifetime in seconds from the time of issue. */
    expires_int: number,
    /** The username associated with this token. */
    userName: string;
    /** ISO 8601 timestamp indicating when the token was issued. */
    '.issued': string;
    /** ISO 8601 timestamp indicating when the token expires. */
    '.expires': string;
}
