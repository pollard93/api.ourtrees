import { TreeDataCareGerminationNotesContent } from '@prisma/client';
import { Ctx, FieldResolver, Int, Resolver, Root } from 'type-graphql';
import { TreeDataCareGerminationNotesContentProfile } from '../../types/TreeDataCareGerminationNotesContentProfile';
import { Context } from '../../utils/types';


@Resolver(() => TreeDataCareGerminationNotesContentProfile)
export class TreeDataCareGerminationNotesContentProfileResolver {
  @FieldResolver(() => Int)
  voteCount(@Root() { id }: TreeDataCareGerminationNotesContent, @Ctx() context: Context<null>): Promise<number> {
    return context.db.read.treeDataCareGerminationNotesVote.count({ where: { contentId: id } });
  }
}
