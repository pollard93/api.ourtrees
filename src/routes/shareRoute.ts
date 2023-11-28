import express from 'express';
import url from 'url';
import { FileHandler } from '../modules/FileHandler';
import { getMobileClientUrl } from '../utils/functions';
import Prisma from '../prisma';
import { BaseRouteProps } from './interfaces';

interface ShareViewProps extends BaseRouteProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
}

/**
 * Route used for sharing
 * Renders views/share/index with seo and deep link
 */
const shareRoute = (e: express.Application) => {
  const prisma = Prisma();

  e.get('/share/:type/:id', async (req, res) => {
    try {
      switch (req.params.type) {
        case 'user':
          const user = await prisma.read.user.findUnique({ where: { id: req.params.id } });
          if (!user) throw new Error();
          const image = await prisma.read.user
            .findUnique({ where: { id: req.params.id } })
            .profilePicture();

          const props: ShareViewProps = {
            title: user.name || '',
            description: user.name || '',
            url: url.format({
              protocol: 'https',
              host: req.get('host'),
              pathname: req.originalUrl,
            }),
            imageUrl: image
              ? await FileHandler.getUrl({
                  path: image.path,
                  thumbnail: 'large',
                })
              : '',
            deepLink: `${getMobileClientUrl()}user/${req.params.id}`,
            appStoreUrl: process.env.APP_STORE_URL || '',
            playStoreUrl: process.env.PLAY_STORE_URL || '',
          };

          return res.render('share/index', props);

        default:
          throw new Error();
      }
    } catch {
      return res.sendStatus(400);
    }
  });
};

export default shareRoute;
