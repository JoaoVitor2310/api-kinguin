import { Request, Response } from 'express';
import { bumpFirstTopic } from '../services/browserService';

export const bumpTopics = async (req: Request, res: Response) => {
    const updatedGames: number[] = [];
    try {
        const result = await bumpFirstTopic();
        res.status(200).json({ message: 'Topics successfully bumped.', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating offers.', updatedGames });
    }
};