import dotenv from 'dotenv';
dotenv.config();

const gamivoFeeGiftCardPercentage = Number(process.env.TAXA_GAMIVO_PORCENTAGEM_GIFT_CARD);
const gamivoFeeGiftCardFixed = Number(process.env.TAXA_GAMIVO_FIXO_GIFT_CARD);

export const giftCardWithoutFee = (lowestPrice: any): number => {
    let lowestPriceWithoutFee: number;
    //     lowestPriceWithoutFee = (lowestPrice - gamivoFeeFixedAbove4) / (1 + gamivoFeePercentageAbove4)
    lowestPriceWithoutFee = lowestPrice - (lowestPrice * gamivoFeeGiftCardPercentage) - gamivoFeeGiftCardFixed;

    if (lowestPriceWithoutFee < 0) {
        lowestPriceWithoutFee = 0.01;
    }

    return lowestPriceWithoutFee;
}