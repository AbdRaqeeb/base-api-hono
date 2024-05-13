import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';

import { mailgunService, mg } from '../../../../src/services/email/mailgun';
import { EmailClientService, SendEmailTemplateParams, SendEmailTextParams } from '../../../../src/types';
import { EmailTypes } from '../../../../src/types/enums';
import logger from '../../../../src/log';

describe('Mailgun Service', () => {
    let emailService: EmailClientService;

    beforeAll(() => {
        emailService = mailgunService();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Send Email Text', () => {
        const data: SendEmailTextParams = {
            from: faker.internet.email(),
            to: [faker.internet.email()],
            subject: faker.word.words(3),
            body: faker.word.words(5),
            reply_to: faker.internet.email(),
            delivery_time: new Date().toISOString(),
            tracking: true,
            track_clicks: true,
            track_opens: true,
            tags: ['test'],
            recipient_variables: { email: faker.internet.email() },
        };

        it('should send email text', async () => {
            const spy = vi.spyOn(mg.messages, 'create');

            await emailService.sendEmailText(data);

            expect(spy).toHaveBeenCalled();
        });

        it('should catch error', async () => {
            vi.spyOn(mg.messages, 'create').mockRejectedValue(() => Promise.reject('error'));

            const spy = vi.spyOn(logger, 'error');

            await emailService.sendEmailText(data);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Send Email Template', () => {
        const data: SendEmailTemplateParams = {
            from: faker.internet.email(),
            to: [faker.internet.email()],
            subject: faker.word.words(3),
            templateData: {},
            emailType: EmailTypes.ConfirmEmail,
            reply_to: faker.internet.email(),
            delivery_time: new Date().toISOString(),
            tracking: true,
            track_clicks: true,
            track_opens: true,
            tags: ['test'],
            recipient_variables: { email: faker.internet.email() },
        };

        it('should send email template', async () => {
            const spy = vi.spyOn(mg.messages, 'create');

            await emailService.sendEmailTemplate(data);

            expect(spy).toHaveBeenCalled();
        });

        it('should catch error', async () => {
            vi.spyOn(mg.messages, 'create').mockRejectedValue(() => Promise.reject('error'));

            const spy = vi.spyOn(logger, 'error');

            await emailService.sendEmailTemplate(data);

            expect(spy).toHaveBeenCalled();
        });
    });
});
