import express, { Express, Request, response, Response } from 'express';
import dotenv from 'dotenv';
import { ItemOverview, Gem, ItemSnipe, IHashNumber, PoeTradeQuery, BuildOverview } from '../lib/types';
import jsonfile from 'jsonfile'

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Poesniper - hello world!');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
fetchGemData().then((gemData) => {
  fetchBuildData().then((buildData) => {
    snipeLevedGems(gemData.lines as Array<Gem>, buildData);
  });
})

async function fetchGemData(): Promise<ItemOverview> {
  const promise = new Promise<ItemOverview>((resolve, reject) => {
    console.log('Fetching gem data...');
    fetch('https://poe.ninja/api/data/itemoverview?league=Sanctum&type=SkillGem&language=en').then(async (response) => {
      console.log('Gem data fetched.');
      let data = await response.json();
      resolve(data);
    }).catch(function (err) {
      console.log("Unable to fetch gem data -", err);
      reject(err)
    });
    console.log('done');
  });
  return promise;
}

async function fetchBuildData(): Promise<BuildOverview> {
  const promise = new Promise<BuildOverview>((resolve, reject) => {
    console.log('Fetching build data...');
    fetch('https://poe.ninja/api/data/latest/getbuildoverview?overview=ssf-sanctum&type=exp&language=en').then(async (response) => {
      console.log('Build data fetched.');
      let data = await response.json();
      resolve(data);
    }).catch(function (err) {
      console.log("Unable to fetch build data -", err);
      reject(err)
    });
    console.log('done');
  });
  return promise;
}

function snipeLevedGems(gemData: Array<Gem>, buildData: BuildOverview): void {
  // Scan divergent type gems
  // let's setup some default filters

  /** minimum usage of a given gem in the league to be considered */
  let FILTER_GEM_USAGE = 2;
  /** minimum return on investment to be considered */
  let FILTER_ROI = 10

  // first grab all divergent gems to narrow down the pool
  let divergent = gemData.filter(({ name }) => name.match(new RegExp('^[D|d]ivergent*', 'g')));
  // then, grab the 21/20 ones out of the bunch, we'll use this as comparison
  let divergentTop = divergent.filter(({ variant }) => variant == '21/20c');

  // we'll now check each of the top gems against it's lv 1 non corrupt variant to see what the price difference is and calculate the estimated profit for leveling and hitting the +1 corrupt
  let snipes: Array<ItemSnipe> = [];
  divergentTop.forEach((gem) => {
    let standardGem = divergent.find(({ name, variant }) => name == gem.name && variant == '1');
    if (standardGem) {
      let estProfit = gem.chaosValue - standardGem.chaosValue;
      let roi = Math.round(estProfit / standardGem.chaosValue);
      if (roi < FILTER_ROI) return;
      standardGem.buildsUsage = checkGemUsage(standardGem, buildData);
      if (standardGem.buildsUsage < FILTER_GEM_USAGE) return;
      snipes.push({
        item: standardGem,
        initialInvestment: standardGem.chaosValue,
        estProfit: estProfit,
        returnOnInvestment: roi,
        poeTradeUrl: prepareTradeUrl(standardGem)
      });
    }
  });
  snipes.sort(compareEstProfitAsInvestmentPctDesc);
  console.log(`sniped ${snipes.length} gems`);
}

function compareEstProfitDesc(a: ItemSnipe, b: ItemSnipe) {
  if (a.estProfit < b.estProfit) return 1;
  if (a.estProfit > b.estProfit) return -1;
  return 0;
}

function compareEstProfitAsInvestmentPctDesc(a: ItemSnipe, b: ItemSnipe) {
  if (a.returnOnInvestment < b.returnOnInvestment) return 1;
  if (a.returnOnInvestment > b.returnOnInvestment) return -1;
  return 0;
}

function checkGemUsage(gem: Gem, buildData: BuildOverview) {
  let iofGem = buildData.allSkills.findIndex((element) => element.name == gem.name);
  if (iofGem < 0) return 0;
  else return buildData.allSkillUse[iofGem].length;
}

function prepareTradeUrl(gem: Gem): string {
  // First we need to take care of alternate quality types, as they are treated different between poe.ninja data and the official trade site
  // Divergent, Anomalous, Phantasmal - those have a separate filter on the trade site and use standard gem name
  // Awakened, Vaal - those are not treated as a separate filter on the trade site
  // .. grab the relevant type from the gem name and normalize
  let typeRegex = new RegExp('Awakened|Anomalous|Divergent|Phantasmal|Vaal', 'g');
  let qualityHash: IHashNumber = {}
  qualityHash["Divergent"] = 2;
  qualityHash["Anomalous"] = 1;
  qualityHash["Phantasmal"] = 3;
  if (gem.name.match(typeRegex)) {
    // This is an alternate quality type gem
    let qualityType = gem.name.match(typeRegex)![0];
    if (qualityHash[qualityType]) {
      gem.tradeAlternateQuality = qualityHash[qualityType];
      gem.tradeName = gem.name.substring(qualityType.length + 1);
    }
  }

  // generate the URL
  let poeTradeUrl = 'https://www.pathofexile.com/trade/search/Sanctum?q=';
  let tradeQuery: PoeTradeQuery = {
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
  }

  if (gem.tradeAlternateQuality) tradeQuery.query.filters.misc_filters.filters.gem_alternate_quality = { option: gem.tradeAlternateQuality };

  poeTradeUrl += encodeURIComponent(JSON.stringify(tradeQuery));

  return poeTradeUrl;
}