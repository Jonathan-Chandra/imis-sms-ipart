/**
 * @fileoverview ASP.NET request-verification token strategy for cloud/iMIS-hosted environments.
 *
 * In cloud deployments the iMIS host injects an anti-forgery token into the
 * page DOM. This class reads that token and returns it so the API client can
 * attach it to outgoing requests.
 *
 * @module auth/imis/CloudAuthorization
 */

import type { IAuthorization } from "./IAuthorization";

/**
 * Authorization strategy for cloud/production iMIS environments.
 *
 * Reads the ASP.NET `RequestVerificationToken` from a hidden `<input>` element
 * injected into the host page by the iMIS iPart framework.
 *
 * @implements {IAuthorization}
 */
export class CloudAuthorization implements IAuthorization {

    /**
     * Returns the request verification token from the host page DOM.
     *
     * @returns {Promise<string>} Resolves to the anti-forgery token string.
     * @throws {Error} If the token element is not present in the DOM.
     */
    async getToken() : Promise<string> {
        return this.getRequestVerificationToken();
    }

    /**
     * Locates and reads the `__RequestVerificationToken` input element.
     *
     * @returns {string} The token value from the DOM element.
     * @throws {Error} If no element with id `__RequestVerificationToken` exists.
     * @private
     */
    private getRequestVerificationToken() : string {
        const tokenElement = document.getElementById("__RequestVerificationToken") as HTMLInputElement;
        if (!tokenElement) throw new Error("Request Verification Token Element not found");
        return tokenElement.value;
    }

}
