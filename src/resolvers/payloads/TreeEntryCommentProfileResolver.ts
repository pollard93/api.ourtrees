import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TreeEntryComment } from '@prisma/client';
import { TreeEntryCommentProfile } from '../../types/TreeEntryCommentProfile';
import { Context } from '../../utils/types';
import { UserProfile } from '../../types/UserProfile';

@Resolver(() => TreeEntryCommentProfile)
export class TreeEntryCommentProfileResolver {
  @FieldResolver(() => UserProfile)
  creator(@Root() { id }: TreeEntryComment, @Ctx() context: Context<null>) {
    return context.db.read.treeEntryComment.findUnique({ where: { id } }).creator();
  }
}
