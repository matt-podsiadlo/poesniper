"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get('/', (req, res) => {
    res.send('Poesniper - hello world!');
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
console.log('starting data grab');
fetchGemData().then((data) => {
    console.log('data grabbed');
    // console.log('lets grab only divergent gems');
    // const regex = new RegExp('^[D|d]ivergent Volatile Dead*', 'g');
    // let divergent = data.lines.filter(({name, variant}) => (name.match(regex)));
    snipeLevedGems(data.lines);
    console.log('done');
});
async function fetchGemData() {
    const promise = new Promise((resolve, reject) => {
        console.log('grabbing data');
        fetch('https://poe.ninja/api/data/itemoverview?league=Sanctum&type=SkillGem&language=en').then(async (response) => {
            console.log('fetched');
            let data = await response.json();
            resolve(data);
        }).catch(function (err) {
            console.log("Unable to fetch -", err);
            reject(err);
        });
        // let response: ItemOverview = jsonfile.readFileSync('data.json');
        console.log('done');
    });
    return promise;
}
function snipeLevedGems(gemData) {
    // Scan divergent type gems
    // first grab all divergent gems to narrow down the pool
    let divergent = gemData.filter(({ name }) => name.match(new RegExp('^[D|d]ivergent*', 'g')));
    // then, grab the 21/20 ones out of the bunch, we'll use this as comparison
    let divergentTop = divergent.filter(({ variant }) => variant == '21/20c');
    // we'll now check each of the top gems against it's lv 1 non corrupt variant to see what the price difference is and calculate the estimated profit for leveling and hitting the +1 corrupt
    let snipes = [];
    divergentTop.forEach((gem) => {
        let standardGem = divergent.find(({ name, variant }) => name == gem.name && variant == '1');
        if (standardGem) {
            let estProfit = gem.chaosValue - standardGem.chaosValue;
            snipes.push({
                item: standardGem,
                initialInvestment: standardGem.chaosValue,
                estProfit: estProfit,
                estProfitAsInvestmentPct: Math.round(estProfit / standardGem.chaosValue),
                poeTradeUrl: prepareTradeUrl(standardGem)
            });
        }
    });
    snipes.sort(compareEstProfit);
    console.log(`sniped ${snipes.length} gems`);
}
function compareEstProfit(a, b) {
    if (a.estProfit < b.estProfit)
        return 1;
    if (a.estProfit > b.estProfit)
        return -1;
    return 0;
}
function prepareTradeUrl(gem) {
    // First we need to take care of alternate quality types, as they are treated different between poe.ninja data and the official trade site
    // Divergent, Anomalous, Phantasmal - those have a separate filter on the trade site and use standard gem name
    // Awakened, Vaal - those are not treated as a separate filter on the trade site
    // .. grab the relevant type from the gem name and normalize
    let typeRegex = new RegExp('Awakened|Anomalous|Divergent|Phantasmal|Vaal', 'g');
    let qualityHash = {};
    qualityHash["Divergent"] = 2;
    qualityHash["Anomalous"] = 1;
    qualityHash["Phantasmal"] = 3;
    if (gem.name.match(typeRegex)) {
        // This is an alternate quality type gem
        let qualityType = gem.name.match(typeRegex)[0];
        if (qualityHash[qualityType]) {
            gem.tradeAlternateQuality = qualityHash[qualityType];
            gem.tradeName = gem.name.substring(qualityType.length + 1);
        }
    }
    // generate the URL
    let poeTradeUrl = 'https://www.pathofexile.com/trade/search/Sanctum?q=';
    let tradeQuery = {
        query: {
            filters: {
                misc_filters: {
                    filters: {
                        corrupted: {
                            option: (gem.corrupted) ? true : false
                        }
                    }
                }
            },
            type: (gem.tradeName) ? gem.tradeName : gem.name
        }
    };
    if (gem.tradeAlternateQuality)
        tradeQuery.query.filters.misc_filters.filters.gem_alternate_quality = { option: gem.tradeAlternateQuality };
    poeTradeUrl += encodeURIComponent(JSON.stringify(tradeQuery));
    return poeTradeUrl;
}
//# sourceMappingURL=server.js.map