export type SoldOffer ={
    product_id: number;
    product_name: string;
    order_id: string;
    rating: string; // '-' pode ser considerado string
    quantity: number;
    net_price: number;
    gross_price: number;
    tax_rate: string; // Exemplo: "19% RO"
    total: number;
    commission: number;
    retail_adverb_bid: number;
    profit: number;
    seller_tax: number;
    created_at: string; // Exemplo: "2025-01-21UTC11:20:400"
    type: string; // Exemplo: "retail"
    order_status: string; // Exemplo: "COMPLETED"
}