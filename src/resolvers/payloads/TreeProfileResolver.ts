import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { Tree } from '@prisma/client';
import { TreeProfile } from '../../types/TreeProfile';
import { Context } from '../../utils/types';
import { TreeDataProfile } from '../../types/TreeDataProfile';
import { UserProfile } from '../../types/UserProfile';


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
}
