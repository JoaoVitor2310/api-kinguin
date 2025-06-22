import axios from "axios";
import { CompareResult } from "../types/CompareResult.js";
import { authService } from "./authService.js";
import { priceWithoutFee } from "../helpers/priceWithoutFee.js";

// Tipo para os offers válidos
export interface ValidOffer {
    offerId: number;
    productId: string;
    status: string;
    priceIWTR: number;
    price: number;
    availableStock: number;
    declaredStock: number;
    declaredTextStock: number;
    fixedAmount: number;
    percentValue: number;
}

// Tipo para a resposta da API de offers
interface OfferResponse {
    _embedded?: {
        offerList: Array<{
            id: number;
            productId: string;
            name: string;
            status: string;
            priceIWTR: number;
            price: number;
            availableStock: number;
            declaredStock: number;
            declaredTextStock: number;
            commissionRule: {
                fixedAmount: number;
                percentValue: number;
            }
        }>;
    };
    _links?: {
        next?: any;
    };
}

export async function getOffers(page: number, size: number): Promise<OfferResponse | false> {

    try {

        const token = await authService();
        const response = await axios.get(`${process.env.SALES_MANAGER_URL}/api/v1/offers?page=${page}&size=${size}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getAllValidOffers(): Promise<ValidOffer[]> {
    const SIZE = 100;
    let currentPage = 0;
    let filteredOffers: ValidOffer[] = [];
    let hasMorePages = true;

    while (hasMorePages) {
        const response = await getOffers(currentPage, SIZE);

        if (!response || !response._embedded || !response._embedded.offerList) {
            break;
        }

        const offers = response._embedded.offerList;

        // Caso queira ver os dados de um jogo específico
        // for (const offer of offers) {
        //     if (offer.productId == '5c9b6e7f2539a4e8f17ef8c2') {
        //         console.log(offer);
        //     }
        // }

        // Filtrar e mapear somente os que queremos
        const validOffers = offers
            .filter((offer) => offer.status === 'ACTIVE' && offer.availableStock !== 0)
            .map((offer) => ({
                offerId: offer.id,
                productId: offer.productId,
                name: offer.name,
                status: offer.status,
                priceIWTR: offer.priceIWTR,
                price: offer.price,
                availableStock: offer.availableStock,
                declaredStock: offer.declaredStock,
                declaredTextStock: offer.declaredTextStock,
                fixedAmount: offer.commissionRule.fixedAmount,
                percentValue: offer.commissionRule.percentValue,
            }));

        // @ts-ignore
        filteredOffers = [...filteredOffers, ...validOffers];

        if (response._links && response._links.next) {
            currentPage++;
        } else {
            hasMorePages = false;
        }
        console.log('currentPage: ' + currentPage);
    }

    return filteredOffers;
}

export async function editOffer(dataToEdit: CompareResult): Promise<boolean> {
    const { productId, menorPreco, offerId, wholesale_mode } = dataToEdit; // Values that will not be changed

    const body = {
        "status": "ACTIVE",
        "price": {
            "amount": dataToEdit.menorPreco * 100, // em centavos
            "currency": "EUR"
        },
        "declaredStock": dataToEdit.declaredStock,
        "maxDeliveryDate": null,
        "declaredTextStock": dataToEdit.declaredTextStock,
        "wholesale": {
            "name": null,
            "enabled": dataToEdit.wholesale_mode,
            "tiers": [
                {
                    "discount": 0,
                    "level": 1,
                    "price": {
                        "amount": dataToEdit.wholesale_price_tier_one!  * 100, // centavos
                        "currency": "EUR"
                    },
                    "priceIWTR": {
                        "amount": priceWithoutFee(dataToEdit.wholesale_price_tier_one, dataToEdit.fixedAmount!, dataToEdit.percentValue!)  * 100,
                        "currency": "EUR"
                    }
                },
                {
                    "discount": 0,
                    "level": 2,
                    "price": {
                        "amount": dataToEdit.wholesale_price_tier_two!  * 100, // centavos
                        "currency": "EUR"
                    },
                    "priceIWTR": {
                        "amount": priceWithoutFee(dataToEdit.wholesale_price_tier_two, dataToEdit.fixedAmount!, dataToEdit.percentValue!)  * 100,
                        "currency": "EUR"
                    }
                },
                {
                    "discount": 0,
                    "level": 3,
                    "price": {
                        "amount": dataToEdit.wholesale_price_tier_three!  * 100, // centavos
                        "currency": "EUR"
                    },
                    "priceIWTR": {
                        "amount": priceWithoutFee(dataToEdit.wholesale_price_tier_three, dataToEdit.fixedAmount!, dataToEdit.percentValue!)  * 100,
                        "currency": "EUR"
                    }
                },
                {
                    "discount": 0,
                    "level": 4,
                    "price": {
                        "amount": dataToEdit.wholesale_price_tier_four!  * 100, // centavos
                        "currency": "EUR"
                    },
                    "priceIWTR": {
                        "amount": priceWithoutFee(dataToEdit.wholesale_price_tier_four, dataToEdit.fixedAmount!, dataToEdit.percentValue!)  * 100,
                        "currency": "EUR"
                    }
                }
            ]
        },
        "description": null,
        "minQuantity": null,
        "deliveryTime": null,
        "deliveryMethods": null
    };

    if (offerId) { // Se quiser ignorar algum jogo, coloque o offerId aqui

        try {
            const token = await authService();
            const response = await axios.put(`${process.env.SALES_MANAGER_URL}/api/v1/offers/${offerId}`, body, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            
            if (response.status == 200) return true;
            else return false;

        } catch (error) {
            console.error(error);
            console.error('Error editing offer with offerId: ' + offerId);
            return false;
        }
    } else {
        console.log('We already have the best price.');
        return false;
    }
}