import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { Tree, TreeEntry } from '@prisma/client';
import { TreeProfile } from '../../types/TreeProfile';
import { Context } from '../../utils/types';
import { TreeEntryProfile } from '../../types/TreeEntryProfile';


@Resolver(() => TreeProfile)
export class TreeProfileResolver {
  @FieldResolver(() => TreeEntryProfile)
  async entries(@Root() { id }: Tree, @Ctx() context: Context): Promise<TreeEntry[]> {
    return context.db.read.treeEntry.findMany({ where: { treeId: id } });
  }
}
