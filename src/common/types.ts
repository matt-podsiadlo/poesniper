export interface Item {
    id: number;
    name: string;
    icon: string;
    levelRequired: number;
    variant: string;
    itemClass: 4;
    chaosValue: number,
    exaltedValue: number;
    divineValue: number;
    count: number;
    detailsId: string;
    listingCount: number;
}

export interface ItemSnipe {
    itemId: number;
    name: string;
    initialInvestment: number;
    estProfit: number;
    estProfitAsInvestmentPct: number;
}

export interface ItemOverview {
    lines: Array<Item>
}

export interface Gem extends Item {
    gemLevel: number;
    gemQuality: number;
} 