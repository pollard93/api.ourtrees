import { MailService, MailDataRequired } from '@sendgrid/mail';
import { CLIENT_TYPE } from '../../utils/types';
import EmailEmitter from './EmailEmitter';
import {
  EMAIL_EVENT_TYPE,
  TransactionalEmailArgs,
  EMAIL_TRANSACTIONAL_TYPE,
  InternalEmailArgs,
  EMAIL_INTERNAL_TYPE,
} from './types';
import { renderGenericTemplate, parseDeepLinkUrl, renderParagraph, renderAnchor } from './utils';

export default class EmailListener {
  private sendGridClient = new MailService();

  constructor(
    private readonly emitter: EmailEmitter,
    disableInitialBind = false,
  ) {
    /**
     * For testing we need to bind after assigning spies/stubs to class methods
     */
    if (!disableInitialBind) {
      this.bindListeners();
    }

    // set up sendgrid
    if (process.env.NODE_ENV !== 'test') {
      this.sendGridClient.setApiKey(process.env.SENDGRID_API_KEY || '');
    }
  }

  bindListeners() {
    this.emitter.addListener(EMAIL_EVENT_TYPE.RAW, this.handleRaw.bind(this));
    this.emitter.addListener(EMAIL_EVENT_TYPE.TRANSACTIONAL, this.handleTransactional.bind(this));
    this.emitter.addListener(EMAIL_EVENT_TYPE.INERNAL, this.handleInternal.bind(this));
  }

  /**
   * Send raw email with sendgrid
   */
  async handleRaw(data: MailDataRequired) {
    /**
     * Block emails on test or if explicit
     */
    if (process.env.BLOCK_EMAILS === 'true' || process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.log('EmailListener -> handleRaw', data);
      return;
    }

    try {
      await this.sendGridClient.send(data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('EmailListener -> handleRaw', e);
      // eslint-disable-next-line no-console
      console.error('EmailListener -> handleRaw -> errors', e?.response?.body?.errors);
    }
  }

  /**
   * Handles transactional emails
   * Define content for each EMAIL_TRANSACTIONAL_TYPE here
   */
  async handleTransactional(args: TransactionalEmailArgs<EMAIL_TRANSACTIONAL_TYPE>) {
    for (const receiver of args.receivers) {
      try {
        switch (args.type) {
          case EMAIL_TRANSACTIONAL_TYPE.PASSWORD_CHANGED:
            await this.handleRaw({
              to: receiver.email,
              from: process.env.EMAIL_FROM_EMAIL || '',
              subject: 'Security Alert: Your password has changed',
              html: await renderGenericTemplate({
                content: `
                  ${renderParagraph(
                    'This is a security email to confirm that your password has been changed.',
                  )}
                  ${renderParagraph(
                    'If this change was not actioned by you, then please get in touch with our team immediately.',
                  )}
                `,
              }),
            });
            break;

          case EMAIL_TRANSACTIONAL_TYPE.PASSWORD_RESET_TOKEN: {
            const { data } =
              args as TransactionalEmailArgs<EMAIL_TRANSACTIONAL_TYPE.PASSWORD_RESET_TOKEN>;

            await this.handleRaw({
              to: receiver.email,
              from: process.env.EMAIL_FROM_EMAIL || '',
              subject: 'Reset your Password',
              html: await renderGenericTemplate({
                content:
                  data.clientType === CLIENT_TYPE.MOBILE
                    ? `
                    ${renderParagraph('Here\'s your reset password link')}
                    ${renderAnchor(parseDeepLinkUrl(`reset-password/${data.token}`), 'Click me!')}
                  `
                    : `
                    ${renderParagraph('Here\'s your reset password link')}
                    ${renderAnchor(
                      `${process.env.CLIENT_URL_WEB}/login/reset-password?token=${data.token}`,
                      'Click me!',
                    )}
                  `,
              }),
            });
            break;
          }

          case EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL: {
            const { data } = args as TransactionalEmailArgs<EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL>;

            await this.handleRaw({
              to: receiver.email,
              from: process.env.EMAIL_FROM_EMAIL || '',
              subject: 'Verify Your Email',
              html: await renderGenericTemplate({
                content:
                  data.clientType === CLIENT_TYPE.MOBILE
                    ? `
                    ${renderParagraph(
                      'Thank you for registering. Please verify your email address for your profile.',
                    )}
                    ${renderParagraph('Verify your email using the link below:')}
                    ${renderAnchor(parseDeepLinkUrl(`verify/${data.token}`), 'Click me!')}
                  `
                    : `
                    ${renderParagraph(
                      'Thank you for registering. Please verify your email address for your profile.',
                    )}
                    ${renderParagraph('Verify your email using the link below:')}
                    ${renderAnchor(
                      `${process.env.CLIENT_URL_WEB}/verify?token=${data.token}`,
                      'Click me!',
                    )}
                  `,
              }),
            });
            break;
          }

          case EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL_CHANGE: {
            const { data } =
              args as TransactionalEmailArgs<EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL_CHANGE>;

            await this.handleRaw({
              to: receiver.email,
              from: process.env.EMAIL_FROM_EMAIL || '',
              subject: 'Email change request',
              html: await renderGenericTemplate({
                content:
                  data.clientType === CLIENT_TYPE.MOBILE
                    ? `
                    ${renderParagraph('Please click the link below to update your email')}
                    ${renderAnchor(parseDeepLinkUrl(`verify-email/${data.token}`), 'Click me!')}
                  `
                    : `
                    ${renderParagraph('Please click the link below to update your email')}
                    ${renderAnchor(
                      `${process.env.CLIENT_URL_WEB}/verify-email/${data.token}`,
                      'Click me!',
                    )}
                  `,
              }),
            });
            break;
          }

          default:
            break;
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
  }

  /**
   * Handles internal emails
   * Define content for each EMAIL_INTERNAL_TYPE here
   */
  async handleInternal(data: InternalEmailArgs<EMAIL_INTERNAL_TYPE>) {
    try {
      switch (data.type) {
        case EMAIL_INTERNAL_TYPE.USER_REGISTERED:
          await this.handleRaw({
            to: process.env.EMAIL_INTERNAL_ADMIN,
            from: process.env.EMAIL_FROM_EMAIL || '',
            subject: 'New user registered',
            html: await renderGenericTemplate({
              content: `Requested user id: ${
                (data as InternalEmailArgs<EMAIL_INTERNAL_TYPE.USER_REGISTERED>).data.user.id
              }`,
            }),
          });
          break;

        default:
          break;
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}
