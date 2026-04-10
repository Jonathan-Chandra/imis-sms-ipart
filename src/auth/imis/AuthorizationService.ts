/**
 * @fileoverview Factory for creating the appropriate iMIS authorization strategy.
 *
 * Selects between {@link LocalAuthorization} and {@link CloudAuthorization}
 * based on the `VITE_AUTH_MODE` environment variable, keeping environment-
 * specific logic out of the API client.
 *
 * @module auth/imis/AuthorizationService
 */

import { CloudAuthorization } from "./CloudAuthorization";
import { LocalAuthorization } from "./LocalAuthorization"

/**
 * Factory function that returns the correct {@link IAuthorization} implementation
 * for the current environment.
 *
 * - `VITE_AUTH_MODE=local` → {@link LocalAuthorization} (OAuth2 password grant)
 * - anything else          → {@link CloudAuthorization} (ASP.NET anti-forgery token)
 *
 * @returns {LocalAuthorization | CloudAuthorization} The authorization service instance.
 */
export function CreateAuthorizationService() {
    if(import.meta.env.VITE_AUTH_MODE === 'local') {
        return new LocalAuthorization();
    }
    return new CloudAuthorization();
}
