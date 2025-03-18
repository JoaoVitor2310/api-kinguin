import { Request, Response } from 'express';
import { bumpSteamTradesTopics } from '../services/browserService.js';

export const bumpTopics = async (req: Request, res: Response) => {
    const updatedGames: number[] = [];
    try {
        const result = await bumpSteamTradesTopics();

        if (!result) {
            return res.status(400).json({ message: 'Topics not bumped.' });
        }

        res.status(200).json({ message: 'Topics successfully bumped.', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating offers.', updatedGames });
    }
};