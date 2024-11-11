import axios, { AxiosError } from "axios";
import { ICompareResult } from "../interfaces/ICompareResult";
import { priceWithoutFee } from "../helpers/priceWithoutFee";
import { checkOthersAPI } from "../helpers/checkOthersAPI";

export async function compareById(productId: number): Promise<ICompareResult> {
    // Comparar o preço dos concorrentes pelo id do jogo e descobrir qual é o menor preço

    //  Passo a passo
    // Definir o productId do jogo em questão
    // Procurar por outras pessoas vendendo aquele msm jogo
    // Descobrir qual é o menor preço que ele está sendo vendido

    let menorPrecoComTaxa, menorPrecoSemTaxa, qtdCandango = 0;

    const sellersToIgnore = ['Kinguin', 'Buy-n-Play', 'Playtime', 'Estateium']; // Ignora esses para abaixar o preço

    // Definir o productId do jogo em questão
    try {
        // Procurar por outras pessoas vendendo aquele msm jogo
        const response = await axios.get(`${process.env.URL}/api/public/v1/products/${productId}/offers`, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });

        // console.log(response.data); // Só descomentar caso queira ver as informações dos vendedores do jogo
        // return { productId, menorPreco: 1 };

        // Descobrir qual é o menor preço que ele está sendo vendido
        let menorPrecoSemCandango = Number.MAX_SAFE_INTEGER, menorPrecoComTaxa; // 
        let menorPrecoTotal = Number.MAX_SAFE_INTEGER; // Define um preço alto para depois ser substituído pelos menores preços de verdade
        let menorPreco; // Só para enviar na resposta
        let segundoMenorPreco; // Como vem ordenado, o segundo é sempre o segundo menor preço
        let offerId, wholesale_mode, wholesale_price_tier_one, wholesale_price_tier_two, menorPrecoParaWholesale;


        if (response.data[0].seller_name !== process.env.NOME_VENDEDOR) { //Não somos o menor preço

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
                if (produto.seller_name !== process.env.NOME_VENDEDOR) {
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
                if (segundoMenorPreco > 1.0) porcentagemDiferenca = 0.1 * segundoMenorPreco;
                else porcentagemDiferenca = 0.05 * segundoMenorPreco;

                if (diferenca >= porcentagemDiferenca) {
                    console.log('SAMFITEIRO!');
                    if (response.data[1].seller_name == process.env.NOME_VENDEDOR) { // Tem samfiteiro, mas ele é o segundo, não altera o preço
                        console.log('Já somos o segundo melhor preço!');
                        return { productId, menorPreco: -4 };
                    } else { // Tem samfiteiro, mas ele não é o segundo, altera o preço
                        console.log(`Menor preço antes: ${menorPreco}`);
                        menorPreco = response.data[1].retail_price;
                        console.log(`Menor preço depois do samfiteiro: ${menorPreco}`);
                    }
                }

                // Calcula o novo preço sem a taxa, a gamivo irá adicionar as taxas dps, e o menorPreco será atingido
                menorPreco = menorPreco - 0.02;

                console.log(menorPreco);
                if (menorPreco > 3.99 && menorPreco < 4.61) { // POR CAUSA DO BUG DA GAMIVO
                    menorPrecoSemTaxa = 3.69
                } else {
                    menorPrecoSemTaxa = priceWithoutFee(menorPreco);
                }
                console.log(menorPrecoSemTaxa);

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

                    console.log(menorPreco);
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