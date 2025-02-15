import axios from "axios";
import * as cheerio from "cheerio";
import { clearDLC } from "../helpers/clearDLC.js";
import { clearString } from "../helpers/clearString.js";
import { clearRegionAndLanguage } from "../helpers/clearRegionAndLanguage.js";
import FormData from 'form-data';

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

export async function bumpSteamTradesTopics(): Promise<any> {
    {
        let data = new FormData();
        data.append('do', 'trade_bump');
        data.append('code', '533Bx'); // HAVE GAMES, WANT TF2
        data.append('xsrf_token', '8efe42208a1293ad19596ad620191cad');

        try {
            const response = await axios.post(`https://www.steamtrades.com/ajax.php`, data, {
                headers: {
                    'Cookie': 'PHPSESSID=1rvcna2ppcg3oba6iouumc8854fp188185ff03gt98ek1lq9; PHPSESSID=1rvcna2ppcg3oba6iouumc8854fp188185ff03gt98ek1lq9',
                }
            });
            // return response.data;
        } catch (error) {
            console.error("Failed to bump 'HAVE GAMES, WANT TF2' topic on SteamTrades");
            console.error(error);
            return false;
        }
    }

    {
        let data = new FormData();
        data.append('do', 'trade_bump');
        data.append('code', 'HVWGM'); // HAVE TF2, WANT POPULAR GAMES 
        data.append('xsrf_token', '8efe42208a1293ad19596ad620191cad');

        try {
            const response = await axios.post(`https://www.steamtrades.com/ajax.php`, data, {
                headers: {
                    'Cookie': 'PHPSESSID=1rvcna2ppcg3oba6iouumc8854fp188185ff03gt98ek1lq9; PHPSESSID=1rvcna2ppcg3oba6iouumc8854fp188185ff03gt98ek1lq9',
                }
            });
            // return response.data;
        } catch (error) {
            console.error("Failed to bump 'HAVE TF2, WANT POPULAR GAMES' topic on SteamTrades");
            console.error(error);
            return false;
        }
    }

    {
        let data = new FormData();
        data.append('do', 'trade_bump');
        data.append('code', 'LgwHr'); // CHOICE TOPIC
        data.append('xsrf_token', '8efe42208a1293ad19596ad620191cad');

        try {
            const response = await axios.post(`https://www.steamtrades.com/ajax.php`, data, {
                headers: {
                    'Cookie': 'PHPSESSID=1rvcna2ppcg3oba6iouumc8854fp188185ff03gt98ek1lq9; PHPSESSID=1rvcna2ppcg3oba6iouumc8854fp188185ff03gt98ek1lq9',
                }
            });
            // return response.data;
        } catch (error) {
            console.error("Failed to bump CHOICE topic on SteamTrades");
            console.error(error);
            return false;
        }
    }

    return true;
}