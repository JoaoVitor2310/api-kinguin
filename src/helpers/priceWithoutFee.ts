import dotenv from 'dotenv';
dotenv.config();

const gamivoFeePercentageAbove4 = Number(process.env.TAXA_GAMIVO_PORCENTAGEM_MAIORIGUAL_4);
const gamivoFeeFixedAbove4 = Number(process.env.TAXA_GAMIVO_FIXO_MAIORIGUAL_4);
const gamivoFeePercentageLess4 = Number(process.env.TAXA_GAMIVO_PORCENTAGEM_MENOR_QUE4);
const gamivoFeeFixedLess4 = Number(process.env.TAXA_GAMIVO_FIXO_MENOR_QUE4);

export const priceWithoutFee = (lowestPrice: any): number => {
      let lowestPriceWithoutFee: number;
      if (lowestPrice < 4) {
            // lowestPriceWithoutFee = (lowestPrice - gamivoFeeFixedLess4) / (1 + gamivoFeePercentageLess4);
            lowestPriceWithoutFee = lowestPrice - (lowestPrice * gamivoFeePercentageLess4) - gamivoFeeFixedLess4;
      }
      else {
            //     lowestPriceWithoutFee = (lowestPrice - gamivoFeeFixedAbove4) / (1 + gamivoFeePercentageAbove4)
            lowestPriceWithoutFee = lowestPrice - (lowestPrice * gamivoFeePercentageAbove4) - gamivoFeeFixedAbove4;
      }

      if (lowestPriceWithoutFee < 0) {
            lowestPriceWithoutFee = 0.01;
      }

      return lowestPriceWithoutFee;
}