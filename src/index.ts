import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv'; 
import jsonfile from 'jsonfile';

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
fetchGemData().then((data) => {
  console.log('data grabbed');
})

async function fetchGemData(): Promise<any> {
  console.log('grabbing data');
  // let response = await fetch('https://poe.ninja/api/data/itemoverview?league=Sanctum&type=SkillGem&language=en');
  let response = jsonfile.readFileSync('data.json');
  console.log('done');
  return response;
}