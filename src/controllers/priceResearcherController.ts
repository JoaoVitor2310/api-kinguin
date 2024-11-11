import { Request, Response } from 'express';
import { getProductIdBySlug } from '../services/productService';
import { bestPriceResearcher } from '../services/comparisonService';

export const priceResearcher = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params; // O jogo está sendo recebido pelo id nos params

    try {

        const productId = await getProductIdBySlug(slug);
        console.log(productId);

        const bestPrice = await bestPriceResearcher(productId);

        res.status(200).json({ message: 'Games successfully found.', menorPreco: bestPrice });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating offers.' });
    }

};
