import axios from "axios";

export async function productIds(): Promise<number[]> { // Lists games that are/were for sale; there may be games with status 0.
    let offset = 0, limit = 100;

    // offset: Starting point for listing games
    // limit: Page limit, cannot exceed 100
    let productIds = [], quantity = 0, totalQuantity = 0, isDone = false, totalActive = 0, totalInactive = 0;
    while (!isDone) {
        const response = await axios.get(`${process.env.URL}/api/public/v1/offers?offset=${offset}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TOKEN}`
            },
        });

        // console.log(response.data);

        quantity = response.data.length;
        totalQuantity += response.data.length; // Total number of offers

        if (response.data.length == 0) { // This is where the while loop ends
            console.log(`Active: ${totalActive}; Inactive: ${totalInactive}`); // Active and inactive offers
            // console.log(`Finished!`);
            isDone = true;
            return productIds;
        }

        for (var i = 0; i < response.data.length; i++) {
            var productId = response.data[i].product_id;
            var status = response.data[i].status;

            if (status == 1) {
                console.log(`productId: ${productId}`);
                productIds.push(productId);
                totalActive += 1;
            } else {
                totalInactive += 1;
            }
        }
        offset += 100;
        console.log(`Offset: ${offset}`);
    }
    return productIds;
}
