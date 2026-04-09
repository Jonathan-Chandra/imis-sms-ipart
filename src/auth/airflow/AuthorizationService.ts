import axios from "axios"

export const getAirflowJWT = async (): Promise<string> => {
    const response = await axios.post("/auth/token", {
        username: import.meta.env.VITE_AIRFLOW_USERNAME,
        password: import.meta.env.VITE_AIRFLOW_PASSWORD
    });
    return response.data.access_token;
}