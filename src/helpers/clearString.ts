export const clearString = (stringToSearch: string): string => {

    const romanRegex = /\b(?!dlc\b)[IVXLCDM]+\b/gi;

    // Substituir números romanos pelo equivalente decimal
    stringToSearch = stringToSearch.replace(romanRegex, (match) => {
        const decimalValue = RomantoInt(match);
        return decimalValue.toString(); // Converter para string para colocar de volta
    });

    // Remove ":", "-", "™" e, quando "-", remove também o espaço subsequente, colocando tudo em minúsculas para melhor reconhecimento dos jogos
    stringToSearch = stringToSearch.replace(/-\s?/g, '').toLowerCase();

    // Remove somente o  ™, : e ®. Precisa ser feito separado
    stringToSearch = stringToSearch.replace(/[™:®]/g, '');

    // Remove "|" e qualquer espaço após ele
    stringToSearch = stringToSearch.replace(/\|\s*/g, ''); // Substitui "|" e qualquer espaço subsequente

    // Remove "'" e qualquer espaço após ele
    stringToSearch = stringToSearch.replace(/\'\s*/g, ''); // Substitui "|" e qualquer espaço subsequente

    // Remove "’" e qualquer espaço após ele
    stringToSearch = stringToSearch.replace(/\’\s*/g, ''); // Substitui "|" e qualquer espaço subsequente

    // Remove "the" (case-insensitive) e qualquer espaço subsequente
    stringToSearch = stringToSearch.replace(/the\s*/gi, '');

    // Remove todas as vírgulas
    stringToSearch = stringToSearch.replace(/,/g, '');


    return stringToSearch;
}

function RomantoInt(romanStr: string): number {
    let num = 0;
    const objRoman: { [key: string]: number } = {
        M: 1000,
        D: 500,
        C: 100,
        L: 50,
        X: 10,
        V: 5,
        I: 1
    };

    // Filtrar apenas os caracteres válidos para numerais romanos
    const filteredRoman = romanStr.toUpperCase().replace(/[^MDCLXVI]/g, '');

    for (let i = 0; i < filteredRoman.length; i++) {
        if (objRoman[filteredRoman[i]] < objRoman[filteredRoman[i + 1]]) {
            num -= objRoman[filteredRoman[i]];
        } else {
            num += objRoman[filteredRoman[i]];
        }
    }

    return num;
}
