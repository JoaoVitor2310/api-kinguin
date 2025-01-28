export type GamivoProduct = {
    id: number;
    name: string;
    slug: string;
    description: string;
    cover: string;
    genres: string[];
    languages: string[];
    platform: string;
    screenshots: string[];
    youtube_video_id: string;
    notice: string;
    region: string;
    release_date: string;
    lowest_price: number;
    lowest_wholesale_tier_one_price: number;
    minimal_selling_price: number;
    is_preorder: boolean;
}