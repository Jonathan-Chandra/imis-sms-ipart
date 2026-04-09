import type { IAuthorization } from "./IAuthorization";

export class CloudAuthorization implements IAuthorization {
    
    async getToken() : Promise<string> {
        return this.getRequestVerificationToken();
    }

    private getRequestVerificationToken() : string {
        const tokenElement = document.getElementById("__RequestVerificationToken") as HTMLInputElement;
        if (!tokenElement) throw new Error("Request Verification Token Element not found");
        return tokenElement.value;

    }
    
}