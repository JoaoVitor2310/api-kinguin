import dotenv from 'dotenv';
dotenv.config();
const sellersToIgnore = ['Buy-n-Play', 'Playtime']; // Ignore these sellers for price increase

export const checkOthersAPI = (responseData: any) => { // If we're in second place and the first seller is in the ignored list and uses an instant API
    if (sellersToIgnore.includes(responseData[0].seller_name) && responseData[1].seller_name == process.env.NOME_VENDEDOR) {

        const first = responseData[0].retail_price; // Price of the first (API seller)
        const second = responseData[1].retail_price; // Our price
        const third = responseData[2].retail_price; // Target price

        const tenPercentOfSecond = second * 0.1; // Ten percent of our price

        const differenceSecondFirst = second - first;

        if (differenceSecondFirst <= tenPercentOfSecond) {

            console.log('Difference with the first is less than ten percent');

            const tenPercentOfThird = third * 0.1; // Ten percent of target price

            const differenceThirdSecond = third - second;
            // console.log(differenceThirdSecond);

            if (differenceThirdSecond >= tenPercentOfThird) {
                console.log('API identified, match the third price');

                return third - 0.02;
            }
        }
    }
    return undefined;
}
