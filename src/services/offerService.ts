import axios from "axios";
import { wholesaleWithoutFee } from "../helpers/wholesaleWithoutFee.js";
import { CompareResult } from "../types/CompareResult.js";
import { GamivoProduct } from "../types/GamivoProduct.js";
import { GamivoProductOffers } from "../types/GamivoProductOffers.js";
import { SoldOffer } from "../types/SoldOffer.js";
import { SalesHistoryResponse } from "../types/SalesHistoryResponse.js";
import { authService } from "./authService.js";

export async function getOffers(page: number, size: number): Promise<any> {

    try {

        const token = await authService();
        console.log(process.env.SALES_MANAGER_URL);
        const response = await axios.get(`${process.env.SALES_MANAGER_URL}/api/v1/offers?page=${page}&size=${size}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        console.log(response);
        return response.data;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function editOffer(dataToEdit: CompareResult): Promise<boolean> {
    const { productId, menorPreco, offerId, wholesale_mode, menorPrecoParaWholesale } = dataToEdit; // Values that will not be changed
    let { wholesale_price_tier_one, wholesale_price_tier_two } = dataToEdit; // Values that can be changed
    let body;

    if (offerId && productId !== 1767 && // 1767: Random game on Gamivo
        productId !== 42931) { // 42931: Spotify Premium 1 Month US  United States

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