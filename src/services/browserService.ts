import axios from "axios";
import * as cheerio from "cheerio";
import { clearDLC } from "../helpers/clearDLC";
import { clearString } from "../helpers/clearString";
import { clearRegionAndLanguage } from "../helpers/clearRegionAndLanguage";

export async function searchPeekPopularity(searchString: string): Promise<number> {
    try {
        console.log('Searching for: ' + searchString);
        searchString = clearDLC(searchString); // String do jogo que será procurado
        searchString = clearRegionAndLanguage(searchString);
        searchString = searchString.toLowerCase();
        searchString = searchString.trim();
        // console.log('searchString: ' + searchString);
        // console.log(`https://steamcharts.com/search/?q=${encodeURIComponent(searchString)}`);
        const response = await axios.get(`https://steamcharts.com/search/?q=${encodeURIComponent(searchString)}`);
        const $ = cheerio.load(response.data);
        searchString = clearString(searchString);

        // Seleciona todos os elementos <a> e extrai os hrefs
        const gamesData = $("a")
            .map((_, el) => ({
                href: $(el).attr("href"), // Extrai o href
                text: $(el).text().trim() // Extrai o texto dentro do link
            }))
            .get();

        let gameLink = ''; // Link do jogo certo;

        for (const game of gamesData) { // Jogos encontrados com o searchString
            let gameName = game.text;
            gameName = clearDLC(gameName);
            gameName = clearString(gameName);
            gameName = clearRegionAndLanguage(gameName);
            gameName = gameName.toLowerCase();
            gameName = gameName.trim();
            if (gameName == searchString) {
                console.log("GameName: " + gameName);
                gameLink = game.href ?? '';
                break; // Finaliza o loop pois encontrou o elemento
            }
        }

        if (gameLink === '') return 0; // Nao encontrou o jogo

        try {
            const response = await axios.get(`https://steamcharts.com${gameLink}`);
            const $ = cheerio.load(response.data);

            const secondNum = $(".app-stat .num").eq(1).text().trim();
            console.log('Popularidade: ' + secondNum);
            return Number(secondNum);
        } catch (error) {
            console.error("Game doesnt have data on SteamCharts:");
            // console.error(error);
            return 0;
        }
    } catch (error) {
        console.error("Game not found on SteamCharts:");
        // console.error(error);
        return 0;
    }
}