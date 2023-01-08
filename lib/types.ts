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
    corrupted: boolean;
}

export interface ItemSnipe {
    item: Item,
    initialInvestment: number;
    estProfit: number;
    estProfitAsInvestmentPct: number;
    poeTradeUrl: string;
}

export interface ItemOverview {
    lines: Array<Item>
}

export interface Gem extends Item {
    gemLevel: number;
    gemQuality: number;
    /** Alternate quality id for the trade site */
    tradeAlternateQuality?: number;
    /** Search name for the trade site */
    tradeName: string;
}

export interface IHashNumber {
    [details: string]: number;
}

export interface PoeTradeQuery {
    query: {
        filters: {
            misc_filters: {
                filters: {
                    gem_level?: { min: number, max: number },
                    corrupted: { option: boolean },
                    gem_alternate_quality?: { option: number },
                    quality?: { min: number, max: number }
                }
            }
        },
        type: string
    }
}