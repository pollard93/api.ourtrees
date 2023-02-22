import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TreeEntry } from '@prisma/client';
import { TreeEntryProfile } from '../../types/TreeEntryProfile';
import { Context } from '../../utils/types';
import { FileProfile } from '../../types/FileProfile';


@Resolver(() => TreeEntryProfile)
export class TreeEntryProfileResolver {
  @FieldResolver(() => FileProfile)
  image(@Root() { id }: TreeEntry, @Ctx() context: Context) {
    return context.db.read.treeEntry.findUnique({ where: { id } }).image();
  }
}
