import { Request, Response } from 'express';
import { productIds, searchByIdGamivo } from '../services/productService.js';
import { compareById } from '../services/comparisonService.js';
import { editOffer, fetchSalesHistory, sendSoldData, soldOrderData } from '../services/offerService.js';
import { SoldOffer } from '../types/SoldOffer.js';
import { SalesHistoryResponse } from '../types/SalesHistoryResponse.js';

export const updateOffers = async (req: Request, res: Response) => {
    const updatedGames: number[] = [];
    try {
        const hora1 = new Date(); // Start time
        const ids = await productIds(); // Retrieve product IDs

        for (const id of ids) {
            const dataToEdit = await compareById(id, true); // Call comparison function
            // console.log(dataToEdit);

            // Fazer requisiçao e buscar por produtos com o productId == idGamivo 
            const games = await searchByIdGamivo(id);
            // console.log(games);
            let minApi: number = 0.12, maxApi: number = 500;

            if (games.length > 0 && dataToEdit.menorPreco > 0) {
                minApi = Math.min(...games.map(game => parseFloat(game.minApiGamivo)));
                maxApi = Math.max(...games.map(game => parseFloat(game.maxApiGamivo)));

                if (dataToEdit.menorPreco < minApi) {
                    dataToEdit.menorPreco = minApi;
                }

                if (dataToEdit.menorPreco > maxApi) {
                    dataToEdit.menorPreco = maxApi;
                }
            }
            const result = await editOffer(dataToEdit);   // Call offer edit function

            if (result) {
                updatedGames.push(id);
            };
        }

        const hora2 = new Date(); // End time

        // Calculate time difference in milliseconds
        const timeDiffMs = hora2.getTime() - hora1.getTime();
        // Convert to seconds
        const timeDiffSeconds = Math.floor(timeDiffMs / 1000);

        console.log(`Total execution time: ${timeDiffSeconds} seconds`);

        res.status(200).json({ message: 'Games successfully updated.', updatedGames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating offers.', updatedGames });
    }
};

export const updateSoldOffers = async (req: Request, res: Response) => {
    const dataToSend = [];
    let offset = 0, isDone: boolean = false, total = 0;

    try {
        while (!isDone) {

            const salesHistory: SalesHistoryResponse | [] = await fetchSalesHistory(offset);
            // const salesHistory: SalesHistoryResponse | [] = // Test
            // {
            //     "count": 22,
            //     "data": [
            //         {
            //             "product_id": 35879,
            //             "product_name": "Commandos 2: Men of Courage EN Global",
            //             "order_id": "fea55df0-188e-11f0-9ebe-069f903b3844",
            //             "rating": "-",
            //             "quantity": 6,
            //             "net_price": 0.85,
            //             "gross_price": 0.85,
            //             "tax_rate": "23% PL",
            //             "total": 5.1,
            //             "commission": -0.84,
            //             "retail_adverb_bid": 0.0,
            //             "profit": 4.26,
            //             "seller_tax": 0.0,
            //             "created_at": "2025-04-13UTC17:44:480",
            //             "type": "retail",
            //             "order_status": "COMPLETED"
            //         },
            //     ]
            // }


            if (Array.isArray(salesHistory) && salesHistory.length === 0) {
                return res.status(400).json({ message: 'Sales history not found.', salesHistory });
            }

            const salesHistoryResponse = salesHistory as SalesHistoryResponse;

            if (salesHistoryResponse.data.length === 0) isDone = true;

            for (const offer of salesHistoryResponse.data) {
                const profit = parseFloat((offer.profit + offer.seller_tax - 0.01).toFixed(2));
                
                const saleDate = offer.created_at.split('UTC')[0];

                const orderData = await soldOrderData(offer.order_id);
                const orderKeys = Object.keys(orderData.keys!);
                

                for (const parent of orderKeys) {
                    if (parent !== offer.product_name) continue;
                    const keys: string[] = [];

                    const keysData = orderData.keys[parent].keys;

                    for (const key of keysData) {
                        keys.push(key.key);
                    }
                    dataToSend.push({ product_name: offer.product_name, profit, saleDate, keys });
                }
            }
            offset += 25;
        }

        for (const [index, game] of dataToSend.entries()) {
            if (game.keys.length > 0) {
                game.profit = game.profit / game.keys.length;
            }

            // if (game.product_name === 'Suzerain EN Global') { // Debug
            //     console.log('Índice:', index);
            // }
        }

        // console.log(dataToSend);
        const response = await sendSoldData(dataToSend);
        return res.status(200).json({ message: 'Games updated successfully.', response: response.data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating offers.' });
    }
}