// src/controllers/offerController.ts
import { Request, Response } from 'express';
import { productIds } from '../services/productService';
import { compareById } from '../services/comparisonService';
import { editOffer } from '../services/offerService';

export const updateOffers = async (req: Request, res: Response) => {
    try {
        console.log('a')
        const ids = await productIds(); // Busca os IDs dos produtos

        // for (const id of ids) {
        //     await compareById(id); // Chama a função de comparação
        //     await editOffer(id);   // Chama a função de edição da oferta
        // }

        res.status(200).send('Jogos atualizados com sucesso.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar as ofertas.');
    }
};
