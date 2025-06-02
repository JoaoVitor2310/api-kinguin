// Função auxiliar para verificar se a diferença entre duas datas é maior que 8 meses
export function isDateOlderThanMonths(dateString: string, months: number): boolean { 
    if (!dateString) return false; // Caso data seja inválida

    const acquiredDate = new Date(dateString); // Converte a string para uma data
    const currentDate = new Date();
    
    // Calcula a diferença em meses
    const yearDiff = currentDate.getFullYear() - acquiredDate.getFullYear();
    const monthDiff = currentDate.getMonth() - acquiredDate.getMonth();
    
    const totalMonthsDiff = yearDiff * 12 + monthDiff;

    // Verifica se a diferença é maior que 8 meses
    return totalMonthsDiff >= months;
}