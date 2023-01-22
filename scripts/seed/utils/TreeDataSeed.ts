import axios from 'axios';
import chalk from 'chalk';
import { Seeder } from './Seeder';
import { COUNTRIES } from '../../../src/utils/countries';

class TreeDataSeeder extends Seeder {
  async createTrees() {
    for (const country of COUNTRIES) {
      console.log(chalk.green(`Processing ${country}`));

      const res = await axios.get(`https://data.bgci.org/treesearch/country/${country}`);

      for (const result of res.data.results) {
        console.log(chalk.green(`Processing ${result.taxon}`));

        try {
          await this.prisma.treeData.upsert({
            where: {
              id: result.id,
            },
            create: {
              id: result.id,
              taxon: result.taxon,
              family: result.family,
              author: result.author,
              source: result.source,
              countries: {
                connectOrCreate: result.TSGeolinks.map((t) => (
                  {
                    where: {
                      name: t.country,
                    },
                    create: {
                      name: t.country,
                    },
                  }
                )),
              },
              careDifficultyResult: {
                create: {
                  count: 0,
                  easy: 0,
                  moderate: 0,
                  hard: 0,
                },
              },
            },
            update: {
              id: result.id,
              taxon: result.taxon,
              family: result.family,
              author: result.author,
              source: result.source,
              countries: {
                connectOrCreate: result.TSGeolinks.map((t) => (
                  {
                    where: {
                      name: t.country,
                    },
                    create: {
                      name: t.country,
                    },
                  }
                )),
              },
            },
          });
        } catch (error) {
          console.log(chalk.green(`Error processing ${result.taxon} in ${country}`));
        }
      }
    }
  }
}

export default TreeDataSeeder;
