import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { Tree } from '@prisma/client';
import { TreeProfile } from '../../types/TreeProfile';
import { Context } from '../../utils/types';
import { TreeDataProfile } from '../../types/TreeDataProfile';
import { UserProfile } from '../../types/UserProfile';
import { TokenType } from '../../modules/Auth/interfaces';

@Resolver(() => TreeProfile)
export class TreeProfileResolver {
  @FieldResolver(() => TreeDataProfile)
  treeData(@Root() { id }: Tree, @Ctx() context: Context<null>) {
    return context.db.read.tree.findUnique({ where: { id } }).treeData();
  }

  @FieldResolver(() => UserProfile)
  creator(@Root() { id }: Tree, @Ctx() context: Context<null>) {
    return context.db.read.tree.findUnique({ where: { id } }).creator();
  }

  @FieldResolver(() => Boolean)
  async following(@Root() { id }: Tree, @Ctx() context: Context<TokenType.GENERAL>) {
    const { email } = context.accessToken.data;
    const hasFollower = await context.db.read.tree
      .findUnique({ where: { id } })
      .followers({ where: { email } });
    return hasFollower && hasFollower.length === 1;
  }
}
