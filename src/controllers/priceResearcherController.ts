import { Request, Response } from 'express';
import { getProductIdBySlug, listProducts } from '../services/productService';
import { bestPriceResearcher, bestRetailPriceWithoutSamfiteiro, bestWholesalePrice, hasMinimumProfit } from '../services/comparisonService';
import { IGamivoProduct } from '../interfaces/IGamivoProduct';
import { productOffers } from '../services/offerService';
import { searchPeekPopularity } from '../services/browserService';
import pLimit from 'p-limit';
import { sendEmailPrice2 } from '../services/emailService';


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
    const hora1 = new Date(); // Start time
    const gamesToBuy = [];
    const limit = 100; // Número de elementos por requisição
    const totalOffsets = 100000; // O offset final é 57700 (dia 28/11/2024), mas estamos indo mais longe para incluir jogos que serão listados futuramente na GAMIVO
    const batchSize = 1000; // Número máximo de requisições paralelas

    const limitConcurrency = pLimit(batchSize); // Busca utilizando concorrência

    try {
        // Calcular os offsets para paralelismo (dividir em batches)
        const offsets = [];
        for (let offset = 2800; offset <= totalOffsets; offset += 100) { // 2800
            offsets.push(offset);
        }

        // Processar todas as requisições de produtos em paralelo com limitação
        const productsBatches = await Promise.all(
            offsets.map(async (offset) => {
                console.log("offset: " + offset);  // Vai imprimir o offset de cada requisição
                return limitConcurrency(() => listProducts(offset, limit)); // Agora estamos retornando a promise
            })
        );

        // Processar todos os produtos
        for (const products of productsBatches) {
            const productPromises = products.map((product) => {
                return limitConcurrency(async () => {
                    console.log('ID: ' + product.id);
                    const offers = await productOffers(product.id);

                    if (offers.length == 0) return null; // Unavailable game

                    const retailPrice = bestRetailPriceWithoutSamfiteiro(offers);
                    const wholesalePrice = bestWholesalePrice(offers);

                    const hasSoftware = ["Antivirus", "Software", "Windows"].some(item => product.genres.includes(item)); // Taxa mt alta, não vale a pena
                    if (hasSoftware) return null;

                    let fee = 'game';

                    let isGiftCard = ["Prepaid", "Xbox Game Pass", "PSN", "Tinder", "Nintendo", "Spotify", "Google Play", "Battle.net", "Apple Store", "Amazon", "Disney plus", "Zalando", "Tidal", "Walmart", "Razer", "Roblox", "Riot Points", "V-bucks"].some(item => product.platform.includes(item)); // Não pesquisa a popularidade quando é gift card

                    fee = isGiftCard ? 'giftcard' : fee;

                    const profit = hasMinimumProfit(retailPrice, wholesalePrice, fee);

                    if (profit > 1) {
                        if (isGiftCard) return { id: product.id, name: product.name, retailPrice: parseFloat(retailPrice.toFixed(2)), wholesalePrice, peekPopularity: 0, profit: parseFloat(profit.toFixed(2)) };

                        const peekPopularity = await searchPeekPopularity(product.name);

                        if (!isGiftCard && peekPopularity > 20) {
                            return { id: product.id, name: product.name, retailPrice: parseFloat(retailPrice.toFixed(2)), wholesalePrice, peekPopularity, profit: parseFloat(profit.toFixed(2)) };
                        }
                    }

                    return null; // Ignore the product if it doesn't meet the conditions
                });
            });

            // Aguardar que todos os produtos do batch sejam processados em paralelo
            const processedProducts = await Promise.all(productPromises);
            gamesToBuy.push(...processedProducts.filter(product => product !== null)); // Remove null values
        }

        const hora2 = new Date(); // End time
        const timeDiffMs = hora2.getTime() - hora1.getTime();
        const timeDiffMinutes = Math.floor(timeDiffMs / 60000); // 60000 ms = 1 minuto

        console.log(`Total execution time: ${timeDiffMinutes} minutes`);
        await sendEmailPrice2(gamesToBuy);
        res.status(200).json({ gamesToBuy });

    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: 'Error searching for price wholesale.' });
    }
};