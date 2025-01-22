import axios from "axios";
import { wholesaleWithoutFee } from "../helpers/wholesaleWithoutFee.js";
import { ICompareResult } from "../interfaces/ICompareResult.js";
import { IGamivoProduct } from "../interfaces/IGamivoProduct.js";
import { IGamivoProductOffers } from "../interfaces/IGamivoProductOffers.js";

export async function editOffer(dataToEdit: ICompareResult): Promise<boolean> {
    const { productId, menorPreco, offerId, wholesale_mode, menorPrecoParaWholesale } = dataToEdit; // Values that will not be changed
    let { wholesale_price_tier_one, wholesale_price_tier_two } = dataToEdit; // Values that can be changed
    let body;

    if (offerId &&
        productId !== 1767 && // 1767: Random game on Gamivo
        productId !== 267 && // 267: Commandos: Behind Enemy Lines
        productId !== 35879 && // 35879: Commandos 2: Men of Courage
        productId !== 129971 && // Internet Cafe Simulator 2
        productId !== 47603 && // LEGO Star Wars: The Skywalker Saga
        productId !== 32064 && // Assassin's Creed Global Ubisoft Connect
        productId !== 3059 && // Jagged Alliance 2: Wildfire EN/DE/FR/PL/RU Global
        productId !== 283) { // 283: Company of Heroes: Tales of Valor

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

export async function productOffers(productId: number): Promise<IGamivoProductOffers[]> {
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

export async function salesHistory(): Promise<any> {
    const filters = {
        "dateFrom": "2025-01-01",
        "dateTo": "2025-01-21",
        "statuses": [
            "COMPLETED"
        ]
    }

    try {
        const response = await axios.get(`${process.env.URL}/api/public/v1/accounts/sales/history/0/100?filters=${JSON.stringify(filters)}`, {
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