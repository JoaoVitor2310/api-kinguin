import dotenv from 'dotenv';
dotenv.config();

const taxaWholesale = Number(process.env.TAXA_WHOLESALE);

export const wholesaleWithoutFee = (menorPreco: number): number => {
    let menorPrecoSemTaxa;
    menorPrecoSemTaxa = menorPreco / taxaWholesale;
    if (menorPrecoSemTaxa <= 0) {
        menorPrecoSemTaxa = 0.01;
    }

    return menorPrecoSemTaxa;
}
