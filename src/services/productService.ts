import axios, { AxiosError, AxiosResponse } from "axios";
import { GameToList } from "../types/GameToList.js";
import { GamivoProduct } from "../types/GamivoProduct.js";
import { sendEmail2 } from "./emailService.js";

export async function productIds(): Promise<number[]> { // Lists games that are/were for sale; there may be games with status 0.
    let offset = 0, limit = 100;

    // offset: Starting point for listing games
    // limit: Page limit, cannot exceed 100
    let productIds = [], quantity = 0, totalQuantity = 0, isDone = false, totalActive = 0, totalInactive = 0;
    while (!isDone) {
        let response: AxiosResponse<any, any>;
        try {
            response = await axios.get(`${process.env.URL}/api/public/v1/offers?offset=${offset}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.TOKEN}`
                },
            });
        } catch (error: AxiosError | any) {
            console.log(error);
            if (error.response.data.codeMessage === 'UNAUTHORIZED_EXPIRED_TOKEN') sendEmail2([], 'Token Gamivo expirado', 'Solicite um token novo no e atualize no .env da api gamivo.');
            return [0];
        }

        // console.log(response.data);

        quantity = response.data.length;
        totalQuantity += response.data.length; // Total number of offers

        if (response.data.length == 0) { // This is where the while loop ends
            console.log(`Active: ${totalActive}; Inactive: ${totalInactive}`); // Active and inactive offers
            // console.log(`Finished!`);
            isDone = true;
            return productIds;
        }

        for (var i = 0; i < response.data.length; i++) {
            var productId = response.data[i].product_id;
            var status = response.data[i].status;

            if (status == 1) {
                console.log(`productId: ${productId}`);
                productIds.push(productId);
                totalActive += 1;
            } else {
                totalInactive += 1;
            }
        }
        offset += 100;
        console.log(`Offset: ${offset}`);
    }
    return productIds;
}

export async function getProductIdBySlug(slug: string): Promise<number> {
    try {
        const response = await axios.get(`${process.env.URL}/api/public/v1/products/by-slug/${slug}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });

        const { id } = response.data;
        return id;
    } catch (error) {
        console.error("Error fetching product by slug:", error);
        throw new Error('Failed to fetch product ID by slug.');
    }
}

export async function getProductsToListFromSistemaEstoque(): Promise<GameToList[]> {
    try {
        const response = await axios.get(`${process.env.URL_SISTEMA_ESTOQUE}/venda-chave-troca/when-to-sell`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching sistema estoque:", error);
        return [];
    }
}

export async function insertDataVendaOnSistemaEstoque(chaveRecebida: string): Promise<number> {
    try {
        const response = await axios.post(`${process.env.URL_SISTEMA_ESTOQUE}/venda-chave-troca/insert-data-venda`, { chaveRecebida });
        return response.status;
    } catch (error) {
        console.error(error);
        console.error("Error updating dataVenda on sistema estoque:");
        return 500;
    }
}

export async function listProducts(offset: number = 0, limit: number = 100): Promise<GamivoProduct[]> {
    try {
        const response = await axios.get(`${process.env.URL}/api/public/v1/products?offset=${offset}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });
        // console.log('offset: ' + offset);
        return response.data;
    } catch (error) {
        console.error("Error fetching products from Gamivo:", error);
        return [];
    }
}

export async function searchByIdGamivo(idGamivo: number): Promise<any[]> {
    try {
        const response = await axios.get(`${process.env.URL_SISTEMA_ESTOQUE}/venda-chave-troca/search-by-id-gamivo/${idGamivo}`);
        return response.data.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}