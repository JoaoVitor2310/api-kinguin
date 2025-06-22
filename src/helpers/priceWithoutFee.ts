export const priceWithoutFee = (lowestPrice: any, fixedAmount: number, percentValue: number): number => {
      let lowestPriceWithoutFee: number;
      
      lowestPriceWithoutFee = (lowestPrice - (fixedAmount / 100)) / (1 + (percentValue / 100));

      if (lowestPriceWithoutFee < 0) {
            lowestPriceWithoutFee = 0.01;
      }

      return lowestPriceWithoutFee;
}