import { Request, Response } from 'express';
import { compareById, searchByIdKinguin } from '../services/comparisonService.js';
import { editOffer, getAllValidOffers } from '../services/offerService.js';

export const updateOffers = async (req: Request, res: Response) => {
    const updatedGames: string[] = [];

    try {
        const hora1 = new Date(); // Start time

        // const filteredOffers = await getAllValidOffers();
        // return res.status(200).json({ message: 'All offers retrieved successfully.', filteredOffers });

        // Teste
        const filteredOffers = [
            {
                "offerId": "66ba677c80086c0001f94bcf",
                "productId": "6370c06a5c53830001167431",
                "name": "Train Simulator Classic - Peninsula Corridor: San Francisco - Gilroy Route Add-On DLC Steam CD Key",
                "status": "ACTIVE",
                "priceIWTR": {
                    "amount": 8,
                    "currency": "EUR"
                },
                "price": {
                    "amount": 44,
                    "currency": "EUR"
                },
                "availableStock": 20,
                "declaredStock": 0,
                "declaredTextStock": 0,
                "fixedAmount": 35,
                "percentValue": 14
            }
        // {
        //     "offerId": "673ca2462a091a0001be4ba0",
        //     "productId": "614ec26c365b2a000175766c",
        //     "name": "Leap of Champions Steam CD Key",
        //     "status": "ACTIVE",
        //     "priceIWTR": {
        //         "amount": 27,
        //         "currency": "EUR"
        //     },
        //     "price": {
        //         "amount": 35,
        //         "currency": "EUR"
        //     },
        //     "availableStock": 1,
        //     "declaredStock": 0,
        //     "declaredTextStock": 0,
        //     "fixedAmount": 5,
        //     "percentValue": 10
        // },
        // {
        //     "offerId": "674262602a091a0001be512d",
        //     "productId": "5c9b6c522539a4e8f17d8ec8",
        //     "name": "Stellar 2D Steam CD Key",
        //     "status": "ACTIVE",
        //     "priceIWTR": {
        //         "amount": 17,
        //         "currency": "EUR"
        //     },
        //     "price": {
        //         "amount": 24,
        //         "currency": "EUR"
        //     },
        //     "availableStock": 1,
        //     "declaredStock": 0,
        //     "declaredTextStock": 0,
        //     "fixedAmount": 5,
        //     "percentValue": 10
        // },
        ];

        for (const offer of filteredOffers) {
            const dataToEdit = await compareById(offer.productId, offer.fixedAmount!, offer.percentValue!);
            dataToEdit.declaredStock = offer.declaredStock;
            dataToEdit.declaredTextStock = offer.declaredTextStock;
            dataToEdit.availableStock = offer.availableStock;
            
            console.log(dataToEdit.menorPreco);  
            // Fazer requisiçao e buscar por produtos com o productId == idKinguin
            const games = await searchByIdKinguin(offer.productId);

            if (games.length > 0 && dataToEdit.menorPreco > 0) {
                const validMinValues = games
                    .map(game => Number(game.minApiKinguin))
                    .filter(num => !isNaN(num) && num > 0);

                const validMaxValues = games
                    .map(game => Number(game.maxApiKinguin))
                    .filter(num => !isNaN(num) && num > 0);

                // Calcula os limites reais vindos da API
                let minApi = validMinValues.length > 0 ? Math.min(...validMinValues) : null;
                let maxApi = validMaxValues.length > 0 ? Math.max(...validMaxValues) : null;

                // Tem minApi e o menorPreco é menor que minApi
                if (minApi !== null && dataToEdit.menorPreco < minApi) {
                    dataToEdit.menorPreco = minApi;
                }

                // Tem maxApi e o menorPreco é menor que maxApi
                if (maxApi !== null && dataToEdit.menorPreco > maxApi) {
                    dataToEdit.menorPreco = maxApi;
                }

                // Garante mínimo aceitável de 0.12
                if (dataToEdit.menorPreco < 0.1) {
                    dataToEdit.menorPreco = 0.1;
                }

                // Garante máximo aceitável de 2000
                if (dataToEdit.menorPreco > 2000) {
                    dataToEdit.menorPreco = 2000;
                }
            }
            console.log(dataToEdit.menorPreco);  

            // const result = await editOffer(dataToEdit);   // Call offer edit function
            // console.log(result);

            // if (result) {
            //     updatedGames.push(offer.productId);
            // };
        }

        const hora2 = new Date(); // End time

        // Calculate time difference in milliseconds
        const timeDiffMs = hora2.getTime() - hora1.getTime();
        // Convert to seconds
        const timeDiffSeconds = Math.floor(timeDiffMs / 1000);

        console.log(`Total Kinguin execution time: ${timeDiffSeconds} seconds`);

        return res.status(200).json({ message: 'All offers updated successfully.', updatedGames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving offers.' });
    }
};