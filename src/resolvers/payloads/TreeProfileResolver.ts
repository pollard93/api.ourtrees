import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { Tree, TreeEntry } from '@prisma/client';
import { TreeProfile } from '../../types/TreeProfile';
import { TreeDataCareDifficultyResultProfile } from '../../types/TreeDataCareDifficultyResultProfile';
import { Context } from '../../utils/types';


@Resolver(() => TreeProfile)
export class TreeProfileResolver {
  @FieldResolver(() => TreeDataCareDifficultyResultProfile)
  async entries(@Root() { id }: Tree, @Ctx() context: Context): Promise<TreeEntry[]> {
    return context.db.read.treeEntry.findMany({ where: { treeId: id } });
  }
}
