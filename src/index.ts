import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv'; 
import jsonfile from 'jsonfile';
import { ItemOverview, Gem, ItemSnipe } from './common/types';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Poesniper - hello world!');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

console.log('starting data grab');
fetchGemData().then(async (data: ItemOverview) => {
  console.log('data grabbed');
  // console.log('lets grab only divergent gems');
  // const regex = new RegExp('^[D|d]ivergent Volatile Dead*', 'g');
  // let divergent = data.lines.filter(({name, variant}) => (name.match(regex)));
  await snipeLevedGems(data.lines as Array<Gem>)
  console.log('done');
})

async function fetchGemData(): Promise<any> {
  console.log('grabbing data');
  // let response = await fetch('https://poe.ninja/api/data/itemoverview?league=Sanctum&type=SkillGem&language=en');
  let response: ItemOverview = jsonfile.readFileSync('data.json');
  console.log('done');
  return response;
}

async function snipeLevedGems(gemData: Array<Gem>): Promise<any> {
  // Scan divergent type gems
  // first grab all divergent gems to narrow down the pool
  let divergent = gemData.filter(({ name }) => name.match(new RegExp('^[D|d]ivergent*', 'g')));
  // then, grab the 21/20 ones out of the bunch, we'll use this as comparison
  let divergentTop = divergent.filter(({ variant }) => variant == '21/20c');
  // we'll now check each of the top gems against it's lv 1 non corrupt variant to see what the price difference is and calculate the estimated profit for leveling and hitting the +1 corrupt
  let snipes: Array<ItemSnipe> = [];
  divergentTop.forEach((gem) => {
    let standardGem = divergent.find(({name, variant}) => name == gem.name && variant == '1');
    if (standardGem) {
      let estProfit = gem.chaosValue - standardGem.chaosValue;
      snipes.push({
        itemId: standardGem.id,
        name: standardGem.name,
        initialInvestment: standardGem.chaosValue,
        estProfit: estProfit,
        estProfitAsInvestmentPct: Math.round(estProfit / standardGem.chaosValue)
      });
    }
  });
  snipes.sort(compareEstProfit);
  console.log(`sniped ${snipes.length} gems`);
}

function compareEstProfit(a: ItemSnipe, b: ItemSnipe) {
  if (a.estProfit < b.estProfit) return 1;
  if (a.estProfit > b.estProfit) return -1;
  return 0;
}