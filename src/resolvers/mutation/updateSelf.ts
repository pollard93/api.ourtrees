import 'reflect-metadata';
import path from 'path';
import { Resolver,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
  InputType,
  Field } from 'type-graphql';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import FileUpload from 'graphql-upload/Upload.js';
import { Prisma, User } from '@prisma/client';
import { FileAuthenticationError, GenericError } from '../../errors';
import { TokenType } from '../../modules/Auth/interfaces';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { Context } from '../../utils/types';
import { FileHandler } from '../../modules/FileHandler';
import { UserSelf } from '../../types/UserSelf';


@InputType()
export class UpdateSelfInput {
  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  countryName?: string

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
    @Arg('data') { name, countryName, profilePicture }: UpdateSelfInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<User> {
    const { id } = context.accessToken.data;


    /**
     * Processes and validates profile picture
     */
    const processProfilePicture = async (): Promise<Prisma.FileUpdateOneWithoutUserProfilePicturesNestedInput> => {
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
      if (!profilePictureResolved.buffer) throw GenericError('Something went wrong with your file uploads');

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
            authorId: id,
          },
        },
      };
    };


    /**
     * Create update input
     */
    const updateInput: Prisma.UserUpdateInput = {
      name,
      country: countryName ? {
        connect: {
          name: countryName,
        },
      } : undefined,
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
