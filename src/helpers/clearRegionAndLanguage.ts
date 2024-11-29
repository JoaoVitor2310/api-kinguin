export const clearRegionAndLanguage = (stringToSearch: string): string => {
    const languageAndRegionRegex = /\b([A-Z]{2}(\s*\/\s*[A-Z]{2})*|global|row|eu|united states)\b/gi;

    // Remove idiomas e regionalidades
    let normalizedString = stringToSearch.replace(languageAndRegionRegex, '');

    // Remover espaços extras criados pela substituição
    normalizedString = normalizedString.replace(/\s{2,}/g, ' ').trim();

    return normalizedString;
};