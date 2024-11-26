import axios, { AxiosError } from "axios";
import { ICompareResult } from "../interfaces/ICompareResult";
import { priceWithoutFee } from "../helpers/priceWithoutFee";
import { checkOthersAPI } from "../helpers/checkOthersAPI";
import { IGamivoProductOffers } from "../interfaces/IGamivoProductOffers";

export async function compareById(productId: number): Promise<ICompareResult> {
    // Comparar o preço dos concorrentes pelo id do jogo e descobrir qual é o menor preço

    let menorPrecoSemTaxa, qtdCandango = 0, menorPrecoSemCandango = Number.MAX_SAFE_INTEGER, menorPrecoTotal = Number.MAX_SAFE_INTEGER, menorPreco, segundoMenorPreco, offerId, wholesale_mode, wholesale_price_tier_one, wholesale_price_tier_two;

    const sellersToIgnore = ['Kinguin', 'Buy-n-Play', 'Playtime', 'Estateium']; // Ignora esses para abaixar o preço

    try {
        // Procurar por outras pessoas vendendo aquele msm jogo
        const response = await axios.get(`${process.env.URL}/api/public/v1/products/${productId}/offers`, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });

        // console.log(response.data); // Só descomentar caso queira ver as informações dos vendedores do jogo
        // return { productId, menorPreco: 1 };


        if (response.data[0].seller_name !== process.env.SELLERS_NAME) { //Não somos o menor preço

            const precoContraAPI = checkOthersAPI(response.data); // Check for competitors with API
            if (precoContraAPI) { // Se já tiver  o menor preço
                console.log('preço contra API')
                return { productId, menorPreco: priceWithoutFee(precoContraAPI) };
            }

            response.data = response.data.filter((offer: { seller_name: string; }) => !sellersToIgnore.includes(offer.seller_name)); // Remove os concorrentes que são para ignorar
            //Separar caso que só tem a gente vendendo
            if (response.data[1]) {
                segundoMenorPreco = response.data[1].retail_price;
            }

            for (const produto of response.data) {
                if (produto.seller_name !== process.env.SELLERS_NAME) {
                    let ignoreSeller = false; // True = candango, false = vendedor experiente
                    // Obtém o preço de varejo do produto

                    const { retail_price: precoAtual, completed_orders: quantidadeVendas } = produto; // Preço de varejo e quantidade de vendas do concorrente

                    if (quantidadeVendas < 4000) {
                        ignoreSeller = true;
                        qtdCandango++;
                    }

                    if (precoAtual < menorPrecoTotal) {
                        menorPrecoTotal = precoAtual; // Define um preço independente se é candango ou não
                    }

                    if (precoAtual < menorPrecoSemCandango) {
                        if (!ignoreSeller) { // Se não for candango
                            menorPrecoSemCandango = precoAtual; // Define um preço considerando SOMENTE vendedores experientes
                        }
                    }
                } else {
                    offerId = produto.id;
                    wholesale_mode = produto.wholesale_mode;
                    wholesale_price_tier_one = produto.wholesale_price_tier_one;
                    wholesale_price_tier_two = produto.wholesale_price_tier_two;
                }
            }


            if (qtdCandango >= 3) {
                console.log(`MAIS DE 3 CANDANGOS NO ID: ${productId} `); // Considera o preço menor independente
                menorPreco = menorPrecoTotal;
            } else {
                menorPreco = menorPrecoSemCandango; // Considera SOMENTE os preços dos vendedores experientes
            }

            // DEALS
            menorPreco = menorPrecoTotal; // Não iremos considerar candangos pois também somos um

            if (response.data.length == 1 || menorPrecoTotal == Number.MAX_SAFE_INTEGER) {
                console.log(`Você é o único vendedor do productId: ${productId}`)
                return { productId, menorPreco: -2 }; // Sem concorrentes
            } else {

                // DEALS
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
                if (segundoMenorPreco > 1.0) porcentagemDiferenca = 0.1 * segundoMenorPreco; // Preço acima de 1, 10% de diferença para ser samfiteiro
                else porcentagemDiferenca = 0.05 * segundoMenorPreco; // Preço abaixo de 1, 5% de diferença para ser samfiteiro

                if (diferenca >= porcentagemDiferenca) {
                    console.log('SAMFITEIRO!');
                    if (response.data[1].seller_name == process.env.SELLERS_NAME) { // Tem samfiteiro, mas somos o segundo, não altera o preço
                        console.log('Já somos o segundo melhor preço!');
                        return { productId, menorPreco: -4 };
                    } else { // Tem samfiteiro, mas ele não somos o segundo, altera o preço
                        console.log(`Batendo o preço do segundo melhor preço!`);
                        menorPreco = response.data[1].retail_price;
                    }
                }

                // Calcula o novo preço sem a taxa, a gamivo irá adicionar as taxas dps, e o menorPreco será atingido
                menorPreco = menorPreco - 0.02;

                if (menorPreco > 3.99 && menorPreco < 4.61) { // POR CAUSA DO BUG DA GAMIVO
                    menorPrecoSemTaxa = 3.69
                } else {
                    menorPrecoSemTaxa = priceWithoutFee(menorPreco);
                }

                console.log(`Para o menorPreco ${menorPreco.toFixed(2)} ser listado, o preço sem taxa deve ser: ${menorPrecoSemTaxa.toFixed(2)}`);

                return { productId, menorPreco: Number(menorPrecoSemTaxa.toFixed(2)), offerId, wholesale_mode, wholesale_price_tier_one, wholesale_price_tier_two, menorPrecoParaWholesale: Number(menorPreco.toFixed(2)) };
            }
        } else { // Nós somos o menor preço
            offerId = response.data[0].id;
            wholesale_mode = response.data[0].wholesale_mode;
            wholesale_price_tier_one = response.data[0].wholesale_price_tier_one;
            wholesale_price_tier_two = response.data[0].wholesale_price_tier_two;

            if (response.data[1]) {
                segundoMenorPreco = response.data[1].retail_price;
                const nossoPreco = response.data[0].retail_price;
                const diferenca = segundoMenorPreco - nossoPreco;


                if (diferenca >= 0.04) {
                    menorPreco = segundoMenorPreco - 0.02;

                    if (menorPreco > 3.99 && menorPreco < 4.61) { // POR CAUSA DO BUG DA GAMIVO
                        menorPrecoSemTaxa = 3.69
                    } else {
                        menorPrecoSemTaxa = priceWithoutFee(menorPreco);
                    }

                    menorPreco = menorPreco.toFixed(2)
                    menorPrecoSemTaxa = menorPrecoSemTaxa.toFixed(2);

                    console.log("ESTAMOS COM O PREÇO ABAIXO, IREMOS AUMENTAR!");
                    console.log(`Para o menorPreco ${menorPreco} ser listado, o preço sem taxa deve ser: ${menorPrecoSemTaxa}`);
                    return { productId, menorPreco: Number(menorPrecoSemTaxa), offerId, wholesale_mode, wholesale_price_tier_one, wholesale_price_tier_two, menorPrecoParaWholesale: Number(menorPreco) };
                } else {
                    return { productId, menorPreco: -4 };
                }
            } else {
                return { productId, menorPreco: -4 };
            }
        }

    } catch (error: AxiosError | any) {
        // console.log('Esse é o error.response: ' + error);
        if (error.response.status == 404 || error.response.status == 403) {
            console.log(`Id: ${productId} é de um jogo 'impossível'`)
            return { productId, menorPreco: -1 };
        } else {
            console.error(error);
            return { productId, menorPreco: -1 };
            // res.status(500).json({ error: 'Erro ao consultar a API externa.' });
        }
    }
}

export async function bestPriceResearcher(productId: number): Promise<any> {
    const response = await axios.get(`${process.env.URL}/api/public/v1/products/${productId}/offers`, {
        headers: {
            'Authorization': `Bearer ${process.env.TOKEN}`
        },
    });

    // Descobrir qual é o menor preço que ele está sendo vendido
    let menorPrecoSemCandango = Number.MAX_SAFE_INTEGER, menorPrecoTotal = Number.MAX_SAFE_INTEGER, menorPreco, qtdCandango = 0, offerId, segundoMenorPreco;

    if (response.data[0].seller_name !== process.env.SELLERS_NAME) { // Nós não somos o menor preço

        //Separar caso que só nós estamos vendendo
        if (response.data[1]) {
            segundoMenorPreco = response.data[1].retail_price;
        }

        for (const produto of response.data) {
            if (produto.seller_name !== process.env.SELLERS_NAME) {
                let ignoreSeller = false; // True = candango, false = vendedor experiente
                // Obtém o preço de varejo do produto

                const { retail_price: precoAtual, completed_orders: quantidadeVendas } = produto; // Preço de varejo e quantidade de vendas do concorrente

                if (quantidadeVendas < 4000) {
                    ignoreSeller = true;
                    qtdCandango++;
                }

                if (precoAtual < menorPrecoTotal) {
                    menorPrecoTotal = precoAtual; // Define um preço independente se é candango ou não
                }

                if (precoAtual < menorPrecoSemCandango) {
                    if (!ignoreSeller) { // Se não for candango
                        menorPrecoSemCandango = precoAtual; // Define um preço considerando SOMENTE vendedores experientes
                    }
                }
            } else {
                offerId = produto.id;
            }
        }

        if (qtdCandango >= 3) {
            console.log(`MAIS DE 3 CANDANGOS NO ID: ${productId} `); // Considera o preço menor independente
            menorPreco = menorPrecoTotal;
        } else {
            menorPreco = menorPrecoSemCandango; // Considera SOMENTE os preços dos vendedores experientes
        }

        // DEALS
        menorPreco = menorPrecoTotal; // Não iremos considerar candangos pois também somos um

        if (response.data.length == 1 || menorPrecoTotal == Number.MAX_SAFE_INTEGER) {
            return response.data[0].retail_price; // Sem concorrentes
        } else {

            if (menorPrecoTotal !== menorPrecoSemCandango) {
                console.log(`TEM CANDANGO NESSE JOGO.`)
                console.log(`menorPrecoTotal: ${menorPrecoTotal}, menorPrecoSemCandango: ${menorPrecoSemCandango}`);
                if (menorPrecoSemCandango == Number.MAX_SAFE_INTEGER) { // Caso os concorrentes sejam < 3 candangos e não tenha nenhum normal
                    return response.data[0].retail_price;
                }
            }

            const diferenca = segundoMenorPreco - menorPreco;
            const porcentagemDiferenca = 0.1 * segundoMenorPreco;

            if (diferenca >= porcentagemDiferenca) {
                console.log('SAMFITEIRO!');
                return response.data[1].retail_price;
            }

            menorPreco = menorPreco - 0.01;

            if (menorPreco < 0.13) {
                menorPreco = 0.13;
            }

            return menorPreco.toFixed(2);
        }

    } else { // Considerando que podemos estar com o preço abaixo
        if (response.data[1]) {

            segundoMenorPreco = response.data[1].retail_price;

            const nossoPreco = response.data[0].retail_price;

            const diferenca = segundoMenorPreco - nossoPreco;

            if (diferenca >= 0.10) {
                menorPreco = segundoMenorPreco - 0.01;
                if (menorPreco < 0.13) {
                    menorPreco = 0.13;
                }

                offerId = response.data[0].id;
                return menorPreco.toFixed(2);
            } else {
                return nossoPreco.toFixed(2);
            }
        } else {
            return response.data[0].retail_price; // alterar pro price-researcher?
        }
    }
}

export function bestRetailPriceWithoutSamfiteiro(offers: IGamivoProductOffers[]): number {
    if(offers.length == 1) return offers[0].retail_price; // Só tem 1 vendedor, retorna o preço dele


    const menorPreco = offers[0].retail_price;
    const segundoMenorPreco = offers[1].retail_price;


    const diferenca = segundoMenorPreco - menorPreco;
    let porcentagemDiferenca;

    // Lógica para os samfiteiros
    if (segundoMenorPreco > 1.0) porcentagemDiferenca = 0.1 * segundoMenorPreco; // Preço acima de 1, 10% de diferença para ser samfiteiro
    else porcentagemDiferenca = 0.05 * segundoMenorPreco; // Preço abaixo de 1, 5% de diferença para ser samfiteiro

    if (diferenca >= porcentagemDiferenca) {
        console.log('SAMFITEIRO NA FUNÇÃO!');
        if (offers[1].seller_name == process.env.SELLERS_NAME) { // Tem samfiteiro, mas somos o segundo
            return offers[1].retail_price;
        } else { // Tem samfiteiro, mas não somos o segundo
            return offers[1].retail_price;
        }
    }
    return offers[0].retail_price;
}

export function bestWholesalePrice(offers: IGamivoProductOffers[]): number {
    if(offers.length == 1) return offers[0].retail_price; // Só tem 1 vendedor, retorna o preço dele
    
    let lowestPrice = Number.MAX_SAFE_INTEGER;

    for (const offer of offers) {
        if (offer.wholesale_price_tier_one < lowestPrice) {
            lowestPrice = offer.wholesale_price_tier_one;
        }
    }
    return lowestPrice;
}