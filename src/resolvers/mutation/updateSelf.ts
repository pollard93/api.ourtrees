import 'reflect-metadata';
import path from 'path';
import { Resolver,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
  InputType,
  Field } from 'type-graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { Prisma, User } from '@prisma/client';
import { FileAuthenticationError } from '../../errors';
import { TokenType } from '../../modules/Auth/interfaces';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { Context } from '../../utils/types';
import { FileHandler } from '../../modules/FileHandler';
import { UserSelf } from '../../types/UserSelf';


@InputType()
export class UpdateSelfInput {
  @Field({ nullable: true })
  name?: string

  @Field(() => GraphQLUpload, { nullable: true })
  profilePicture?: FileUpload
}


@Resolver()
export class UpdateSelfResolver {
  @Mutation(() => UserSelf)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async updateSelf(
    @Arg('data') { name, profilePicture }: UpdateSelfInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<User> {
    const { id } = context.accessToken.data;


    /**
     * Processes and validates profile picture
     */
    const processProfilePicture = async (): Promise<Prisma.FileUpdateOneWithoutAuthorInput> => {
      // Validate image
      const { resolved, rejected } = await FileHandler.validateGraphQLUploads([profilePicture as any], {
        mimes: ['image/jpeg'],
        maxFileSize: 5000000,
      });

      if (Object.keys(rejected).length) {
        throw FileAuthenticationError('Something went wrong with your file uploads', rejected);
      }

      // eslint-disable-next-line prefer-destructuring
      const profilePictureResolved = resolved[0];

      // Store in bucket
      const url = await FileHandler.putImage(`public/users/${id}/profile-picture${path.extname(profilePictureResolved.filename)}`, profilePictureResolved.buffer);

      // Upsert to create if already exists
      return {
        upsert: {
          update: {
            path: url.full,
            mime: profilePictureResolved.mimetype,
          },
          create: {
            path: url.full,
            mime: profilePictureResolved.mimetype,
          },
        },
      };
    };


    /**
     * Create update input
     */
    const updateInput: Prisma.UserUpdateInput = {
      name,
    };


    if (profilePicture) {
      updateInput.profilePicture = await processProfilePicture();
    }


    /**
     * Update user and return
     */
    return context.db.write.user.update({
      where: {
        id,
      },
      data: updateInput,
    });
  }
}
