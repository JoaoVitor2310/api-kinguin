import axios from "axios";

export async function productIds(): Promise<number[]> {
    // Lista os jogos que estão/tiveram a venda, podem ter jogos com o status 0.
    let offset = 0, limit = 100;

    // offset: A partir de qual jogo vai mostrar
    // limit: Limite por página, não pode ser maior que 100
    let productIds = [], quantidade = 0, quatidadeTotal = 0, isDone = false, totalAtivos = 0, totalInativos = 0;
    while (!isDone) {
        const response = await axios.get(`${process.env.URL}/api/public/v1/offers?offset=${offset}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });

        // console.log(response);
        // return;


        quantidade = response.data.length;
        quatidadeTotal += response.data.length; // Quantidade total de ofertas

        if (response.data.length == 0) { // Aqui que termina o loop do while
            console.log(`Ativos: ${totalAtivos}; Inativos: ${totalInativos}`); // Anúncios ativos e não ativos
            console.log(`Acabou!`);
            isDone = true;
            return productIds;
        }

        for (var i = 0; i < response.data.length; i++) {
            var productId = response.data[i].product_id;
            var status = response.data[i].status;

            if (status == 1) {
                console.log(`productId: ${productId}`);
                productIds.push(productId);
                totalAtivos += 1
            } else {
                totalInativos += 1
            }
        }
        offset += 100;
        console.log(`Offset: ${offset}`);
    }
    return productIds;
}