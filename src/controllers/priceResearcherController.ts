import { Request, Response } from 'express';
import { getProductIdBySlug, listProducts } from '../services/productService';
import { bestPriceResearcher, bestRetailPriceWithoutSamfiteiro, bestWholesalePrice, bestWholesalePrice } from '../services/comparisonService';
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

        let products: IGamivoProduct[] = [];

        products = await listProducts();
        // console.log(products);

        // Iniciar loop

        for (const product of products) {
            console.log('ID: ' + product.id);
            const offers = await productOffers(product.id);
            
            if(offers.length == 0) continue; // Unavailable game


            const retailPrice = bestRetailPriceWithoutSamfiteiro(offers);
            console.log("Retail: " + retailPrice);
            
            const wholesalePrice = bestWholesalePrice(offers);
            console.log("Wholesale: " + wholesalePrice);

            const investimentoWholesale = wholesalePrice * 10;
            const faturamentoretail = retailPrice * 10;

            const lucro = faturamentoretail - investimentoWholesale;
            const lucroMinimo = 0.2 * investimentoWholesale;
            if (lucro >= lucroMinimo) {
                console.log("AQUI");
                console.log("Lucro: " + lucro);
                gamesToBuy.push(product);
            }
        }

        // Checar o gênero(as taxas mudam)

        // Procurar por vendedores que vendam por wholesale

        // Checar se vale a pena comprar no whole e vendar no retail

        // Se sim, adicionar a um array

        // Finaliza loop

        // Enviar email com todos os jogos que podem valer a pena



        res.status(200).json({ message: 'Games successfully found.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error searching wholesale offers.' });
    }

};
