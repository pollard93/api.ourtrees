import axios from 'axios';
import chalk from 'chalk';
import { Seeder } from './Seeder';
import { COUNTRIES } from '../../../src/utils/countries';

class TreeDataSeeder extends Seeder {
  async createTrees() {
    for (const country of COUNTRIES) {
      // eslint-disable-next-line no-console
      console.log(chalk.green(`Processing ${country}`));

      const res = await axios.get(`https://data.bgci.org/treesearch/country/${country}`);

      for (const result of res.data.results) {
        // eslint-disable-next-line no-console
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
                connectOrCreate: result.TSGeolinks.map((t) => ({
                  where: {
                    name: t.country,
                  },
                  create: {
                    name: t.country,
                  },
                })),
              },
              careDifficultyResult: {
                create: {
                  count: 0,
                  easy: 0,
                  moderate: 0,
                  hard: 0,
                },
              },
              careWaterResult: {
                create: {
                  count: 0,
                  weekly: 0,
                  biweekly: 0,
                  triweekly: 0,
                },
              },
              careSunlightResult: {
                create: {
                  count: 0,
                  indirect: 0,
                  partial: 0,
                  direct: 0,
                },
              },
              carePlantingResult: {
                create: {
                  count: 0,
                  jan: 0,
                  feb: 0,
                  mar: 0,
                  apr: 0,
                  may: 0,
                  jun: 0,
                  jul: 0,
                  aug: 0,
                  sep: 0,
                  oct: 0,
                  nov: 0,
                  dec: 0,
                },
              },
              careObtainingSeedsResult: {},
              careHowToPlantSeedsResult: {},
              careGerminationDifficultyResult: {
                create: {
                  count: 0,
                  easy: 0,
                  moderate: 0,
                  hard: 0,
                },
              },
              careWhenToReleaseResult: {
                create: {
                  count: 0,
                  jan: 0,
                  feb: 0,
                  mar: 0,
                  apr: 0,
                  may: 0,
                  jun: 0,
                  jul: 0,
                  aug: 0,
                  sep: 0,
                  oct: 0,
                  nov: 0,
                  dec: 0,
                },
              },
              careGerminationNotesResult: {},
            },
            update: {
              id: result.id,
              taxon: result.taxon,
              family: result.family,
              author: result.author,
              source: result.source,
              countries: {
                connectOrCreate: result.TSGeolinks.map((t) => ({
                  where: {
                    name: t.country,
                  },
                  create: {
                    name: t.country,
                  },
                })),
              },
            },
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(chalk.green(`Error processing ${result.taxon} in ${country}`));
        }
      }
    }
  }
}

export default TreeDataSeeder;
