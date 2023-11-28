import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, Field, InputType } from 'type-graphql';
import { Prisma, TreeEntry } from '@prisma/client';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import FileUpload from 'graphql-upload/Upload.js';
import uuid4 from 'uuid4';
import path from 'path';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { FileAuthenticationError, GenericError } from '../../errors';
import { FileHandler } from '../../modules/FileHandler';
import { TreeEntryProfile } from '../../types/TreeEntryProfile';

@InputType()
export class CreateTreeEntryInput {
  @Field()
  treeId: string;

  @Field()
  notes: string;

  @Field()
  createdAt: string;

  @Field(() => GraphQLUpload, { nullable: true })
  image?: FileUpload;
}

@Resolver()
export class CreateTreeEntryResolver {
  @Mutation(() => TreeEntryProfile)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async createTreeEntry(
    @Arg('data') { treeId, notes, createdAt, image }: CreateTreeEntryInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeEntry> {
    const { id: creatorId } = context.accessToken.data;

    /**
     * Get tree and validate owner
     */
    const tree = await context.db.read.tree.findUnique({
      where: {
        id: treeId,
      },
    });
    if (!tree) throw GenericError('Tree does not exist');
    if (tree.creatorId !== creatorId) throw GenericError('Unauthorized');

    /**
     * Create id so can be used for image url
     */
    const id = uuid4();

    /**
     * Processes and validates profile picture
     */
    const processImage = async (): Promise<Prisma.FileCreateNestedOneWithoutTreeEntriesInput> => {
      // Validate image
      const { resolved, rejected } = await FileHandler.validateGraphQLUploads([image as any], {
        mimes: ['image/jpeg'],
        maxFileSize: 5000000,
      });

      if (Object.keys(rejected).length) {
        throw FileAuthenticationError('Something went wrong with your file uploads', rejected);
      }

      // eslint-disable-next-line prefer-destructuring
      const imageResolved = resolved[0];

      // Store in bucket
      const url = await FileHandler.putImage(
        `public/trees/${treeId}/entries/${id}${path.extname(imageResolved.filename)}`,
        imageResolved.buffer!,
      );

      // Create
      return {
        create: {
          path: url.full,
          mime: imageResolved.mimetype,
          author: {
            connect: {
              id: creatorId,
            },
          },
        },
      };
    };

    /**
     * Create and return tree entry
     */
    return context.db.write.treeEntry.create({
      data: {
        id,
        notes,
        createdAt,
        image: image ? await processImage() : undefined,
        tree: { connect: { id: treeId } },
      },
    });
  }
}
