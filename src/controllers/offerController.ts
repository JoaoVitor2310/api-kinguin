import { Request, Response } from 'express';
import { productIds } from '../services/productService.js';
import { compareById } from '../services/comparisonService.js';
import { editOffer } from '../services/offerService.js';

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
