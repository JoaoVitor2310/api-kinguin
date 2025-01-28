export type GamivoProductOffers = {
    id: number;
    product_id: number;
    product_name: string;
    seller_name: string;
    completed_orders: number;
    rating: number;
    retail_price: number;
    wholesale_price_tier_one: number;
    wholesale_price_tier_two: number;
    stock_available: number;
    invoicable: boolean;
    status: number;
    wholesale_mode: number;
    is_preorder: boolean;
}