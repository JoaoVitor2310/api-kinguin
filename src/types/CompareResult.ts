export type CompareResult = {
    productId: string;
    menorPreco: number;
    offerId?: string; 
    wholesale_mode?: number;
    wholesale_price_tier_one?: number;
    wholesale_price_tier_two?: number;
    wholesale_price_tier_three?: number;
    wholesale_price_tier_four?: number;
    menorPrecoParaWholesale?: number;
    declaredStock?: number;
    declaredTextStock?: number;
    availableStock?: number;
    fixedAmount?: number;
    percentValue?: number;
}