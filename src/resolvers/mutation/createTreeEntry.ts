import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType } from 'type-graphql';
import { Tree } from '@prisma/client';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeProfile } from '../../types/TreeProfile';


@InputType()
export class CreateTreeEntryInput {
  @Field()
  treeId: string

  @Field()
  notes: string

  @Field()
  createdAt: string

  @Field(() => GraphQLUpload, { nullable: true })
  image?: FileUpload
}


@Resolver()
export class CreateTreeEntryResolver {
  @Mutation(() => TreeProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async createTreeEntry(
    @Arg('data') { treeId, notes, createdAt }: CreateTreeEntryInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<Tree> {
    const { id: creatorId } = context.accessToken.data;
    // @TODO - validate user owns the tree
    // @TODO - images
    return context.db.write.tree.update({
      where: {
        id: treeId,
      },
      data: {
        entries: {
          create: {
            notes,
            createdAt,
          },
        },
      },
    });
  }
}
