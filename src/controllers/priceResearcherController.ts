import { Request, Response } from 'express';
import { getProductIdBySlug, listProducts } from '../services/productService';
import { bestPriceResearcher, bestRetailPriceWithoutSamfiteiro, bestWholesalePrice, hasMinimumProfit } from '../services/comparisonService';
import { IGamivoProduct } from '../interfaces/IGamivoProduct';
import { productOffers } from '../services/offerService';

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

export const priceWholesale = async (req: Request, res: Response): Promise<void> => {
    const gamesToBuy = [];
    try {

        // Pegar todos os product ids da gamivo || pegar todos da página atual

        let offset = 0, limit = 100, isDone = false;

        while (!isDone) {
            let products: IGamivoProduct[] = await listProducts(offset, limit);

            if (products.length == 0) { // This is where the while loop ends
                isDone = true;
                return;
            }




            // Iniciar loop

            for (const product of products) {
                console.log('ID: ' + product.id);
                const offers = await productOffers(product.id);

                if (offers.length == 0) continue; // Unavailable game


                const retailPrice = bestRetailPriceWithoutSamfiteiro(offers);
                // console.log("Retail: " + retailPrice);

                // Procurar por vendedores que vendam por wholesale
                const wholesalePrice = bestWholesalePrice(offers);
                // console.log("Wholesale: " + wholesalePrice);

                // Checar o gênero(as taxas mudam)
                const hasSoftware = ["Antivirus", "Software", "Windows"].some(item => product.genres.includes(item));

                if (hasSoftware) continue;

                // Checar se vale a pena comprar no whole e vendar no retail. Se sim, adicionar a um array
                if (hasMinimumProfit(retailPrice, wholesalePrice)) gamesToBuy.push(product);

            }

            offset += 100;
        }

        // Finaliza loop

        // Enviar email com todos os jogos que podem valer a pena



        res.status(200).json({ message: 'Games successfully found.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error searching wholesale offers.' });
    }

};
