import dotenv from 'dotenv';
dotenv.config();

const gamivoFeePercentageAbove4 = Number(process.env.TAXA_GAMIVO_PORCENTAGEM_MAIORIGUAL_4);
const gamivoFeeFixedAbove4 = Number(process.env.TAXA_GAMIVO_FIXO_MAIORIGUAL_4);
const gamivoFeePercentageLess4 = Number(process.env.TAXA_GAMIVO_PORCENTAGEM_MENOR_QUE4);
const gamivoFeeFixedLess4 = Number(process.env.TAXA_GAMIVO_FIXO_MENOR_QUE4);

export const priceWithFee = (lowestPrice: any): number => {
      let lowestPriceWithtFee: number;
      if (lowestPrice < 4) {
            lowestPriceWithtFee = lowestPrice + gamivoFeeFixedLess4 + (lowestPrice * gamivoFeePercentageLess4);
      }
      else {
            lowestPriceWithtFee = lowestPrice + (lowestPrice * gamivoFeePercentageAbove4) + gamivoFeeFixedAbove4;
      }

      return lowestPriceWithtFee;
}