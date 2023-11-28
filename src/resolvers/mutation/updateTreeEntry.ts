import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, Field, InputType } from 'type-graphql';
import { Prisma, TreeEntry } from '@prisma/client';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import FileUpload from 'graphql-upload/Upload.js';
import path from 'path';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { FileAuthenticationError, GenericError } from '../../errors';
import { FileHandler } from '../../modules/FileHandler';
import { TreeEntryProfile } from '../../types/TreeEntryProfile';

@InputType()
export class UpdateTreeEntryInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  image?: FileUpload;
}

@Resolver()
export class UpdateTreeEntryResolver {
  @Mutation(() => TreeEntryProfile)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async updateTreeEntry(
    @Arg('data') { id, notes, image }: UpdateTreeEntryInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeEntry> {
    const { id: creatorId } = context.accessToken.data;

    /**
     * Get tree entry and validate owner
     */
    const treeEntry = await context.db.read.treeEntry.findUnique({
      where: {
        id,
      },
      include: {
        tree: true,
      },
    });
    if (!treeEntry) throw GenericError('Tree entry does not exist');
    if (treeEntry.tree.creatorId !== creatorId) throw GenericError('Unauthorized');

    /**
     * Processes and validates profile picture
     */
    const processImage = async (): Promise<Prisma.FileUpdateOneWithoutTreeEntriesNestedInput> => {
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
        `public/trees/${treeEntry.treeId}/entries/${id}${path.extname(imageResolved.filename)}`,
        imageResolved.buffer!,
      );

      // Upsert to create if already exists
      return {
        upsert: {
          create: {
            path: url.full,
            mime: imageResolved.mimetype,
            author: {
              connect: {
                id: creatorId,
              },
            },
          },
          update: {
            path: url.full,
            mime: imageResolved.mimetype,
          },
        },
      };
    };

    /**
     * Update and return tree entry
     */
    return context.db.write.treeEntry.update({
      where: {
        id,
      },
      data: {
        id,
        notes,
        image: image ? await processImage() : undefined,
      },
    });
  }
}
