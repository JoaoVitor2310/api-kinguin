import axios, { AxiosError } from "axios";
import { CompareResult } from "../types/CompareResult.js";
import { priceWithoutFee } from "../helpers/priceWithoutFee.js";

export async function compareById(productId: string, fixedAmount: number, percentValue: number, consideraSamfit = true): Promise<CompareResult> {
    // Comparar o preço dos concorrentes pelo id do jogo e descobrir qual é o menor preço

    let menorPrecoSemTaxa, qtdCandango = 0, menorPrecoSemCandango = Number.MAX_SAFE_INTEGER, menorPrecoTotal = Number.MAX_SAFE_INTEGER, menorPreco, segundoMenorPreco, offerId;

    let wholesale_mode, wholesale_price_tier_one, wholesale_price_tier_two, wholesale_price_tier_three, wholesale_price_tier_four;

    const sellersToIgnore = ['Kinguin']; // Ignora esses para abaixar o preço

    try {
        // Procurar por outras pessoas vendendo aquele msm jogo
        let response = await axios.get(`${process.env.GATEWAY_KINGUIN_URL}/products/${productId}`, {
            headers: {
                'X-Api-Key': process.env.X_API_KEY
            },
        });

        let responseOffers = response.data.offers;

        if (responseOffers.length === 0) return { productId, menorPreco: -5 }; // Produto não encontrado

        responseOffers = responseOffers.sort((a: any, b: any) => a.price - b.price); // Ordena os preços em ordem crescente

        if (responseOffers[0].merchantName !== process.env.SELLERS_NAME) { //Não somos o menor preço

            if (consideraSamfit) {
                responseOffers = responseOffers.filter((offer: { merchantName: string; }) => !sellersToIgnore.includes(offer.merchantName)); // Remove os concorrentes que são para ignorar
            }

            //Separar caso que só tem a gente vendendo
            if (responseOffers[1]) {
                segundoMenorPreco = responseOffers[1].price;
            }

            for (const produto of responseOffers) {
                if (produto.merchantName !== process.env.SELLERS_NAME) {
                    let ignoreSeller = false; // True = candango, false = vendedor experiente
                    // Obtém o preço de varejo do produto

                    const { price: precoAtual } = produto; // Preço de varejo e quantidade de vendas do concorrente
                    // const {  completed_orders: quantidadeVendas } = produto; // Preço de varejo e quantidade de vendas do concorrente

                    // if (quantidadeVendas < 4000) {
                    //     ignoreSeller = true;
                    //     qtdCandango++;
                    // }

                    if (precoAtual < menorPrecoTotal) {
                        menorPrecoTotal = precoAtual; // Define um preço independente se é candango ou não
                    }

                    if (precoAtual < menorPrecoSemCandango) {
                        if (!ignoreSeller) { // Se não for candango
                            menorPrecoSemCandango = precoAtual; // Define um preço considerando SOMENTE vendedores experientes
                        }
                    }
                } else {
                    offerId = produto.offerId;
                    wholesale_mode = produto.wholesale.enabled;
                    wholesale_price_tier_one = produto.wholesale.tiers[0].price;
                    wholesale_price_tier_two = produto.wholesale.tiers[1].price;
                    wholesale_price_tier_three = produto.wholesale.tiers[2].price;
                    wholesale_price_tier_four = produto.wholesale.tiers[3].price;
                }
            }

            // return wholesale_enabled;


            if (qtdCandango >= 3) {
                // console.log(`MAIS DE 3 CANDANGOS NO ID: ${productId} `); // Considera o preço menor independente
                menorPreco = menorPrecoTotal;
            } else {
                menorPreco = menorPrecoSemCandango; // Considera SOMENTE os preços dos vendedores experientes
            }

            menorPreco = menorPrecoTotal; // Não iremos considerar candangos

            if (responseOffers.length == 1 || menorPrecoTotal == Number.MAX_SAFE_INTEGER) {
                //console.log(`Único vendedor do productId: ${productId}`)
                return { productId, menorPreco: -2 }; // Sem concorrentes
            } else {

                // if (menorPrecoTotal !== menorPrecoSemCandango) {
                //       console.log(`TEM CANDANGO NESSE JOGO.`)
                //       console.log(`menorPrecoTotal: ${menorPrecoTotal}, menorPrecoSemCandango: ${menorPrecoSemCandango}`);
                //       if (menorPrecoSemCandango == Number.MAX_SAFE_INTEGER) { // Caso os concorrentes sejam < 3 candangos e não tenha nenhum normal
                //             res.json({ id, menorPreco: -4 });
                //             return;
                //       }
                // }

                const diferenca = segundoMenorPreco - menorPreco;
                let porcentagemDiferenca;

                // Lógica para os samfiteiros
                if (consideraSamfit) {

                    porcentagemDiferenca = 0.1 * segundoMenorPreco;

                    if (diferenca >= porcentagemDiferenca) {
                        console.log('SAMFITEIRO!');
                        if (responseOffers[1].merchantName == process.env.SELLERS_NAME) { // Tem samfiteiro, mas somos o segundo, não altera o preço
                            // console.log('Já somos o segundo melhor preço!');
                            return { productId, menorPreco: -4 };
                        } else { // Tem samfiteiro, mas não somos o segundo, altera o preço
                            // console.log(`Batendo o preço do segundo melhor preço!`);
                            menorPreco = responseOffers[1].price;
                        }
                    }
                }

                // Calcula o novo preço sem a taxa, a kinguin irá adicionar as taxas dps, e o menorPreco será atingido
                menorPreco = menorPreco - 0.015;

                console.log('menorPreco: ' + menorPreco);
                menorPrecoSemTaxa = priceWithoutFee(menorPreco, fixedAmount, percentValue);
                console.log('menorPrecoSemTaxa: ' + menorPrecoSemTaxa.toFixed(2));

                return { productId, menorPreco: Number(menorPrecoSemTaxa.toFixed(2)), offerId, wholesale_mode, wholesale_price_tier_one, wholesale_price_tier_two, wholesale_price_tier_three, wholesale_price_tier_four, menorPrecoParaWholesale: Number(menorPreco.toFixed(2)) };
            }
        } else { // Nós somos o menor preço
            offerId = responseOffers[0].offerId;
            wholesale_mode = responseOffers[0].wholesale.enabled;
            wholesale_price_tier_one = responseOffers[0].wholesale.tiers[0].price;
            wholesale_price_tier_two = responseOffers[0].wholesale.tiers[1].price;
            wholesale_price_tier_three = responseOffers[0].wholesale.tiers[2].price;
            wholesale_price_tier_four = responseOffers[0].wholesale.tiers[3].price;

            if (responseOffers[1]) {
                segundoMenorPreco = responseOffers[1].price;
                const nossoPreco = responseOffers[0].price;
                const diferenca = segundoMenorPreco - nossoPreco;


                if (diferenca >= 0.04) {
                    menorPreco = segundoMenorPreco - 0.015;
                    menorPrecoSemTaxa = priceWithoutFee(menorPreco, fixedAmount, percentValue);

                    menorPreco = menorPreco.toFixed(2)
                    menorPrecoSemTaxa = menorPrecoSemTaxa.toFixed(2);
                    console.log('aumentando o preço no productId: ' + productId);

                    return { productId, menorPreco: Number(menorPrecoSemTaxa), offerId, wholesale_mode, wholesale_price_tier_one, wholesale_price_tier_two, menorPrecoParaWholesale: Number(menorPreco) };
                } else {
                    return { productId, menorPreco: -4 };
                }
            } else {
                return { productId, menorPreco: -4 };
            }
        }

    } catch (error: AxiosError | any) {
        if (error.response && error.response.status !== 404) { // 404 é quando não tem ngm vendendo, não vai logar   
            console.log(error);
            console.log('Catch do compareById no productId: ' + productId);
        }
        return { productId, menorPreco: -1 };
    }
}

export async function searchByIdKinguin(idKinguin: string): Promise<any[]> {
    try {
        const response = await axios.get(`${process.env.URL_SISTEMA_ESTOQUE}/venda-chave-troca/search-by-id-kinguin/${idKinguin}`);
        return response.data.data;
    } catch (error) {
        // console.error(error);
        return [];
    }
}