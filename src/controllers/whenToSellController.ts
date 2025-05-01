import { Request, Response } from 'express';
import { getProductIdBySlug, getProductsToListFromSistemaEstoque } from '../services/productService.js';
import { bestPriceResearcher, compareById } from '../services/comparisonService.js';
import { priceWithFee } from '../helpers/priceWithFee.js';
import { GameToList } from '../types/GameToList.js';
import { sendEmail, sendEmail2 } from '../services/emailService.js';
import { isDateOlderThanMonths } from '../helpers/isDateOlderThanEightMonths.js';

export const whenToSell = async (req: Request, res: Response): Promise<void> => {
    const gamesToSell: GameToList[] = [];
    try {

        // Fazer req

        const gamesFromAPI: GameToList[] = await getProductsToListFromSistemaEstoque();
        // const gamesFromAPI: GameToList[] = [ // Teste
        // {
        //     "idGamivo": "1645",
        //     "minimoParaVenda": "0.35",
        //     "chaveRecebida": "R46NA-IR4LE-ABBJC",
        //     "nomeJogo": "War for the Overworld",
        //     "dataAdquirida": "2025-03-23"
        // },
        // ];

        // console.log(gamesFromAPI);
        // Loop nos jogos
        for (const game of gamesFromAPI) {
            // Ver se o menor preco é maior que o minimoParaVenda
            const bestPrice = await compareById(Number(game.idGamivo), false);

            if (bestPrice.menorPreco === -5) {
                sendEmail2([game.idGamivo], 'Jogo com Id Gamivo incorreto', 'Não foi encontrado nenhum jogo com o id gamivo a seguir');
                continue;
            }

            // Pegar o valor do jogo com as taxas
            const bestPriceWithFee = priceWithFee(bestPrice.menorPreco);

            game.maisDe8Meses = isDateOlderThanMonths(game.dataAdquirida);

            if (bestPriceWithFee > Number(game.minimoParaVenda) || game.maisDe8Meses) {
                // Juntar jogos que podem ser listados
                gamesToSell.push(game);
            }
        }

        gamesToSell.sort((a: any, b: any) => a.maisDe8Meses - b.maisDe8Meses);

        const gamesToSellByPrice = gamesToSell.filter(game => game.maisDe8Meses === false);
        const gamesToSellByTime = gamesToSell.filter(game => game.maisDe8Meses === true);
        

        // Enviar email avisando os jogos que podem ser listados
        if (gamesToSellByPrice.length > 0) {
            await sendEmail2(gamesToSellByPrice, `When to Sell PREÇO`, `Jogos a serem vendidos por PREÇO`);
        }
        
        if (gamesToSellByTime.length > 0) {
            await sendEmail2(gamesToSellByTime, `When to Sell TEMPO`, `Jogos a serem vendidos por TEMPO`);
        }

        res.status(200).json({ message: 'Games successfully checked.', gamesToSell });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking when to sell offers.' });
    }

};
