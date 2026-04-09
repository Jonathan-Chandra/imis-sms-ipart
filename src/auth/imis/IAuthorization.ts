export interface IAuthorization {
    getToken(): Promise<string>;
}