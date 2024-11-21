import { Request, Response } from 'express';
import { getProductIdBySlug, getProductsToListFromSistemaEstoque } from '../services/productService';
import { bestPriceResearcher, compareById } from '../services/comparisonService';
import { priceWithFee } from '../helpers/priceWithFee';

export const whenToSell = async (req: Request, res: Response): Promise<void> => {
    const gamesToSell = [];
    try {

        // const bestPrice =await compareById(130959);

        // console.log(bestPrice);

        // const bestPriceWithFee = priceWithFee(bestPrice.menorPreco);

        // console.log(bestPriceWithFee);

        // Fazer req

        const gamesFromAPI = await getProductsToListFromSistemaEstoque();

        // Loop nos jogos

        for (const game of gamesFromAPI) {
            // Ver se o menor preco é maior que o minimoParaVenda

            const bestPrice = await compareById(Number(game.idGamivo));

            console.log(bestPrice);

            const bestPriceWithFee = priceWithFee(bestPrice.menorPreco);

            if(bestPriceWithFee > Number(game.minimoParaVenda)){
                gamesToSell.push(game);
            }

            console.log(bestPriceWithFee);

            // Juntar jogos que podem ser listados


        }

        // Enviar email avisando que pode listar




        // const productId = await getProductIdBySlug(slug);
        // console.log(productId);

        // const bestPrice = await bestPriceResearcher(productId);

        res.status(200).json({ message: 'Games successfully checked.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating offers.' });
    }

};
