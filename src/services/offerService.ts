import axios from "axios";
import { wholesaleWithoutFee } from "../helpers/wholesaleWithoutFee.js";
import { CompareResult } from "../types/CompareResult.js";
import { GamivoProduct } from "../types/GamivoProduct.js";
import { GamivoProductOffers } from "../types/GamivoProductOffers.js";
import { SoldOffer } from "../types/SoldOffer.js";
import { SalesHistoryResponse } from "../types/SalesHistoryResponse.js";

export async function editOffer(dataToEdit: CompareResult): Promise<boolean> {
    const { productId, menorPreco, offerId, wholesale_mode, menorPrecoParaWholesale } = dataToEdit; // Values that will not be changed
    let { wholesale_price_tier_one, wholesale_price_tier_two } = dataToEdit; // Values that can be changed
    let body;

    if (offerId && productId !== 1767 && // 1767: Random game on Gamivo
        productId !== 42931){ // 42931: Spotify Premium 1 Month US  United States

        switch (wholesale_mode) {
            case 0:
                body = {
                    "wholesale_mode": 0,
                    "seller_price": menorPreco,
                };
                break;
            case 1: // If wholesale, it will calculate the wholesale price and add it to the body
                if (menorPrecoParaWholesale) {
                    wholesale_price_tier_one = wholesaleWithoutFee(menorPrecoParaWholesale);
                    wholesale_price_tier_two = wholesaleWithoutFee(menorPrecoParaWholesale);
                }

                body = { // seller_price must be higher than wholesale prices
                    "wholesale_mode": 1,
                    "seller_price": menorPreco,
                    "tier_one_seller_price": wholesale_price_tier_one,
                    "tier_two_seller_price": wholesale_price_tier_two
                };
                break;
            case 2: // If wholesale, it will calculate the wholesale price and add it to the body
                if (menorPrecoParaWholesale) {
                    wholesale_price_tier_one = wholesaleWithoutFee(menorPrecoParaWholesale);
                    wholesale_price_tier_two = wholesaleWithoutFee(menorPrecoParaWholesale);
                }

                body = { // seller_price must be higher than wholesale prices
                    "wholesale_mode": 2,
                    "seller_price": menorPreco,
                    "tier_one_seller_price": wholesale_price_tier_one,
                    "tier_two_seller_price": wholesale_price_tier_two
                };
                console.log("The wholesale_mode value is 2.");
                break;
            default:
                console.log("The wholesale_mode value is not 0, 1, or 2.");
                break;
        }

    try {
        const response = await axios.put(`${process.env.URL}/api/public/v1/offers/${offerId}`, body, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });

        if (response.data == offerId) {
            console.log('OK!')
            return true;
        } else {
            console.log('Error updating the price');
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
} else {
    console.log('We already have the best price.');
    return false;
}
}

export async function productOffers(productId: number): Promise<GamivoProductOffers[]> {
    try {
        const response = await axios.get(`${process.env.URL}/api/public/v1/products/${productId}/offers`, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching products from Gamivo:", error);
        return [];
    }
}

export async function fetchSalesHistory(offset: number = 25): Promise<SalesHistoryResponse | []> {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Converter para YYYY-MM-DD
    const todayFormatted = today.toISOString().split('T')[0];
    const oneMonthAgoFormatted = oneMonthAgo.toISOString().split('T')[0];

    const filters = {
        "dateFrom": oneMonthAgoFormatted,
        "dateTo": todayFormatted,
        "statuses": [
            "COMPLETED"
        ]
    }

    try {
        const response = await axios.get(`${process.env.URL}/api/public/v1/accounts/sales/history/${offset}/25?filters=${JSON.stringify(filters)}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching sales history from Gamivo:", error);
        return [];
    }
}

export async function soldOrderData(order_id: string): Promise<any> {
    try {
        const response = await axios.get(`${process.env.URL}/api/public/v1/accounts/sales/order-details/${order_id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching sales history from Gamivo:", error);
        return [];
    }
}

export async function sendSoldData(dataToSend: object): Promise<any> {
    try {
        const response = await axios.post(`${process.env.URL_SISTEMA_ESTOQUE}/venda-chave-troca/update-sold-offers`, dataToSend);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching sales history from Gamivo:", error);
        return [];
    }
}
