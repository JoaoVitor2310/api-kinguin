import { Request, Response } from 'express';
import { productIds } from '../services/productService.js';
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
            const dataToEdit = await compareById(id); // Call comparison function
            // console.log(dataToEdit);
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
                const pai = orderKeys[0];
                const keysData = orderData.keys[pai].keys;
                const keys: string[] = [];

                for (const key of keysData) {
                    keys.push(key.key);
                }

                dataToSend.push({ product_name: offer.product_name, profit, saleDate, keys });
            }
            offset += 25;
        }

        for (const [index, game] of dataToSend.entries()) {
            if (game.keys.length > 0) {
                game.profit = game.profit / game.keys.length;
            }

            // Suzerain
            // if (game.product_name === 'Suzerain EN Global') {
            //     console.log('Índice:', index);
            // }
        }

        const response = await sendSoldData(dataToSend);
        return res.status(200).json({ message: 'Games updated successfully.', response: response.data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating offers.' });
    }
}