import { Request, Response } from 'express';
import { productIds, searchByIdGamivo } from '../services/productService.js';
import { compareById } from '../services/comparisonService.js';
import { editOffer, fetchSalesHistory, sendSoldData, soldOrderData } from '../services/offerService.js';
import { SoldOffer } from '../types/SoldOffer.js';
import { SalesHistoryResponse } from '../types/SalesHistoryResponse.js';
import axios, { AxiosError } from 'axios';
import qs from 'qs';

export const updateOffers = async (req: Request, res: Response) => {
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
        console.log(response.data);
    } catch (error: AxiosError | any) {
        console.log(error);
        console.log(process.env.URL);
        res.status(200).json({ message: 'Games successfully updated.', error });
        return;
    }

    res.status(200).json({ message: 'Games successfully updated.'});
    return;

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