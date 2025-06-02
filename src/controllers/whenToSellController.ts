import { Request, Response } from 'express';
import { getProductIdBySlug, getProductsToListFromSistemaEstoque, insertDataVendaOnSistemaEstoque } from '../services/productService.js';
import { bestPriceResearcher, compareById } from '../services/comparisonService.js';
import { priceWithFee } from '../helpers/priceWithFee.js';
import { GameToList } from '../types/GameToList.js';
import { sendEmail, sendEmail2 } from '../services/emailService.js';
import { isDateOlderThanMonths } from '../helpers/isDateOlderThanEightMonths.js';
import { createOffer, insertOfferKey } from '../services/offerService.js';

export const whenToSell = async (req: Request, res: Response): Promise<void> => {
    const gamesToSell: GameToList[] = [];
    try {
        const gamesToSellAutomatically: GameToList[] = [];


        // Busca os jogos que ainda não foram posto a venda
        const gamesFromAPI: GameToList[] = await getProductsToListFromSistemaEstoque();

        // const gamesFromAPI: GameToList[] = [ // Teste
        //     {
        //         "idGamivo": "132055",
        //         "minimoParaVenda": "0.45",
        //         "chaveRecebida": "WC0F4-WCE09-6LMHJ",
        //         "nomeJogo": "Conan Chop Chop",
        //         "dataAdquirida": "2024-05-30"
        //     },
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

            game.maisDe10Meses = isDateOlderThanMonths(game.dataAdquirida, 10);
            game.maisDe12Meses = isDateOlderThanMonths(game.dataAdquirida, 12);


            if ((bestPriceWithFee > Number(game.minimoParaVenda) || game.maisDe10Meses) && !game.maisDe12Meses) {
                // Juntar jogos que podem ser listados
                gamesToSell.push(game);
            }

            if (game.maisDe12Meses) {
                // Criar a offer
                const createOfferData = {
                    "product": game.idGamivo, // productId
                    "wholesale_mode": 0,
                    "seller_price": bestPrice,
                    "tier_one_seller_price": 0,
                    "tier_two_seller_price": 0,
                    "status": 1,
                    "keys": 1,
                    "is_preorder": false
                }

                const offerId = await createOffer(createOfferData);

                if (Array.isArray(offerId) && offerId.length === 0) {
                    console.log(`Nenhuma oferta criada`);
                    await sendEmail2([], `When to Sell ERRO`, `A seguinte key deu erro ao criar a oferta: ${game.chaveRecebida}`);
                    continue;
                }

                // Inserir key na offer

                const offerKeyResponse = await insertOfferKey(offerId, { "keys": [game.chaveRecebida] });

                // Atualizar no sistema que a key foi posta a venda
                const insertDataVenda = await insertDataVendaOnSistemaEstoque(game.chaveRecebida);

                if (insertDataVenda !== 200) {
                    await sendEmail2([], `When to Sell ERRO`, `A seguinte key foi posta a venda mas a 'data posto a venda' no sistema não entrou: ${game.chaveRecebida}`);
                    continue;
                }

                gamesToSellAutomatically.push(game);
            }
        }

        gamesToSell.sort((a: any, b: any) => a.maisDe10Meses - b.maisDe10Meses);

        const gamesToSellByPrice = gamesToSell.filter(game => game.maisDe10Meses === false);
        const gamesToSellByTime = gamesToSell.filter(game => game.maisDe10Meses === true);

        // Enviar email avisando os jogos que podem ser listados
        if (gamesToSellByPrice.length > 0) {
            await sendEmail2(gamesToSellByPrice, `When to Sell PREÇO`, `Jogos a serem vendidos por PREÇO`);
        }

        if (gamesToSellByTime.length > 0) {
            await sendEmail2(gamesToSellByTime, `When to Sell TEMPO`, `Jogos a serem vendidos por TEMPO`);
        }

        if (gamesToSellAutomatically.length > 0) {
            // await sendEmail2(gamesToSellByTime, `When to Sell TEMPO`, `Jogos a serem vendidos por TEMPO`);
            await sendEmail2(gamesToSellAutomatically, `When to Sell AUTOMÁTICO`, `Esses foram os jogos listados a venda automaticamente por tempo`);
        }

        res.status(200).json({ message: 'Games successfully checked.', gamesToSellByPrice, gamesToSellByTime, gamesToSellAutomatically });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking when to sell offers.' });
    }

};
