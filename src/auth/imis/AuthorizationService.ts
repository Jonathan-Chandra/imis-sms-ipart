import { CloudAuthorization } from "./CloudAuthorization";
import { LocalAuthorization } from "./LocalAuthorization"

export function CreateAuthorizationService() {
    if(import.meta.env.VITE_AUTH_MODE === 'local') {
        return new LocalAuthorization();
    }
    return new CloudAuthorization();
}