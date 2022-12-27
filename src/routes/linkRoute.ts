import express from 'express';
import { BaseRouteProps } from './interfaces';


interface LinkRouteProps extends BaseRouteProps { }


/**
 * Route used for deep links from api, reset password etc
 * Renders views/share/index with seo and deep link
 */
const linkRoute = (e: express.Application) => {
  e.get('/deep-link/:location', async (req, res) => {
    /**
     * Location is base64 encoded
     */
    const deepLink = Buffer.from(req.params.location, 'base64').toString('utf-8');

    /**
     * Define props for template
     */
    const props: LinkRouteProps = {
      title: 'Made By Prism',
      deepLink,
      appStoreUrl: process.env.APP_STORE_URL,
      playStoreUrl: process.env.PLAY_STORE_URL,
    };

    return res.render('link/index', props);
  });
};

export default linkRoute;
