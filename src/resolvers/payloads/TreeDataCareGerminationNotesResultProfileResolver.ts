import { TreeDataCareGerminationNotesContent, TreeDataCareGerminationNotesResult } from '@prisma/client';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TreeDataCareGerminationNotesContentProfile } from '../../types/TreeDataCareGerminationNotesContentProfile';
import { TreeDataCareGerminationNotesResultProfile } from '../../types/TreeDataCareGerminationNotesResultProfile';
import { Context } from '../../utils/types';


@Resolver(() => TreeDataCareGerminationNotesResultProfile)
export class TreeDataCareGerminationNotesResultProfileResolver {
  @FieldResolver(() => TreeDataCareGerminationNotesContentProfile)
  async content(@Root() { id }: TreeDataCareGerminationNotesResult, @Ctx() context: Context<null>): Promise<TreeDataCareGerminationNotesContent | null | undefined> {
    return (await context.db.read.treeDataCareGerminationNotesResult.findUnique({ where: { id }, include: { content: true } }))?.content;
  }
}
