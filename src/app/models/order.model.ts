export interface Order {
    id: number;
    symbol: string;
    openPrice: number;
    openTime: number;
    swap: number;
    size: number;
    side: 'BUY' | 'SELL';
}