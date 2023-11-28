import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TreeComment } from '@prisma/client';
import { TreeCommentProfile } from '../../types/TreeCommentProfile';
import { Context } from '../../utils/types';
import { UserProfile } from '../../types/UserProfile';

@Resolver(() => TreeCommentProfile)
export class TreeCommentProfileResolver {
  @FieldResolver(() => UserProfile)
  creator(@Root() { id }: TreeComment, @Ctx() context: Context<null>) {
    return context.db.read.treeComment.findUnique({ where: { id } }).creator();
  }
}
