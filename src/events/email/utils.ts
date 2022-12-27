import * as path from 'path';
import * as fs from 'fs-extra';
import Mustache from 'mustache';
import { getMobileClientUrl } from '../../utils/functions';


/**
 * Gets a template as string
 */
export const TEMPLATE_GENERIC = fs.readFileSync(path.join(__dirname, '../../views/email/generic.mustache'), 'utf8');
export const PARTIAL_ANCHOR = fs.readFileSync(path.join(__dirname, '../../views/email/partials/anchor.mustache'), 'utf8');
export const PARTIAL_PARAGRAPH = fs.readFileSync(path.join(__dirname, '../../views/email/partials/paragraph.mustache'), 'utf8');


/**
 * Gets generic templates and replaces content
 */
export const renderGenericTemplate = (data: {content: string}) => Mustache.render(TEMPLATE_GENERIC, {
  ...data,
  url: process.env.SITE_URL,
});


/**
 * Renders paragraph - http://emailframe.work/
 */
export const renderParagraph = (content) => Mustache.render(PARTIAL_PARAGRAPH, { content });


/**
 * Renders anchor - http://emailframe.work/
 */
export const renderAnchor = (href: string, content: string) => Mustache.render(PARTIAL_ANCHOR, { href, content });


/**
 * Parses a base64 string for use in a browser redirect
 * @param url - without proceeding '/'
 */
export const parseMobileUrl = (url: string) => Buffer.from(`${getMobileClientUrl()}${url}`).toString('base64');


/**
 * Parses a deep-link url, with base64 encoded mobileUrl
 * see 'src/routes/linkRoute.ts' for more details
 * @param url - without proceeding '/'
 */
export const parseDeepLinkUrl = (url: string) => `${process.env.SITE_URL}/deep-link/${parseMobileUrl(url)}`;
