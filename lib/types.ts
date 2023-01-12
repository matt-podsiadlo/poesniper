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
    /** Estimated return on initial investment. E.g. if initialInvestment is 10, estProfit is 90, the returnOnInvestment value will be 9 */
    returnOnInvestment: number;
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
    /** How many characters use this gem in the current league ladder */
    buildsUsage?: number;
}

/** Represents data from https://poe.ninja/api/data/latest/getbuildoverview?overview=ssf-sanctum&type=exp&language=en */
export interface BuildOverview {
    classNames: Array<string>;
    classes: Array<number>;
    uniqueItems: Array<BuildsItem>;
    uniqueItemsUse: BuildsItemUse;
    activeSkills: Array<BuildsSkills>;
    activeSkillUse: BuildsItemUse;
    allSkills: Array<BuildsSkills>;
    allSkillUse: BuildsItemUse;
}

export interface BuildsItem {
    name: string;
    type: string;
}

export interface BuildsItemUse {
    [index: string]: Array<number>
}

export interface BuildsSkills {
    name: string;
    icon: string;
    dpsName: string;
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