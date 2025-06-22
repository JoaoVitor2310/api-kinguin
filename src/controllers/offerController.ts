import { Request, Response } from 'express';
import { compareById } from '../services/comparisonService.js';
import { editOffer, getAllValidOffers } from '../services/offerService.js';

export const updateOffers = async (req: Request, res: Response) => {
    const updatedGames: string[] = [];

    try {
        const filteredOffers = await getAllValidOffers();
        // return res.status(200).json({ message: 'All offers retrieved successfully.', filteredOffers });

        // Teste
        // const filteredOffers = [
        //     {
        //         "offerId": "683f365a53a94f4fc408d134",
        //         "productId": "5c9b7b5d2539a4e8f1861a57",
        //         "name": "Archangel: Hellfire - Fully Loaded DLC Steam CD Key",
        //         "status": "ACTIVE",
        //         "priceIWTR": {
        //             "amount": 56,
        //             "currency": "EUR"
        //         },
        //         "price": {
        //             "amount": 67,
        //             "currency": "EUR"
        //         },
        //         "availableStock": 1,
        //         "declaredStock": 0,
        //         "declaredTextStock": 0
        //     },
        // ];

        for (const offer of filteredOffers) {
            const dataToEdit = await compareById(offer.productId, offer.fixedAmount!, offer.percentValue!);
            dataToEdit.declaredStock = offer.declaredStock;
            dataToEdit.declaredTextStock = offer.declaredTextStock;
            dataToEdit.availableStock = offer.availableStock;

            const result = await editOffer(dataToEdit);   // Call offer edit function
            console.log(result);

            if (result) {
                updatedGames.push(offer.productId);
            };
        }

        return res.status(200).json({ message: 'All offers updated successfully.', updatedGames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving offers.' });
    }
};