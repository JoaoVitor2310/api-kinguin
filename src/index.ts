import { productIds } from './services/productService';
import { compareById } from './services/comparisonService';
import { editOffer } from './services/offerService';

async function main() {
    const hora1: string = new Date().toLocaleTimeString();
    let jogosAtualizados: number[] = [];
    
    try {
        const ids = await productIds(); // Busca os IDs dos produtos

        // Loop pelos IDs dos produtos
        for (const id of ids) {
            await compareById(id);  // Chama a função de comparação
            await editOffer(id);     // Chama a função de edição da oferta
        }

        console.log('Jogos atualizados com sucesso.');
    } catch (error) {
        console.error(error);
    }
}

main();