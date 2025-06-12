import axios, { AxiosError } from "axios";
import qs from "qs";

export const authService = async () => {
    let response;
    try {
        response = await axios.post(
            `${process.env.AUTH_URL}/auth/token`,
            qs.stringify({
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error: AxiosError | any) {
        console.log(error); 
        console.log('Erro ao buscar token na API da kinguin.');
        return false;
    }
}