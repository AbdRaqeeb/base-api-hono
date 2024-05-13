import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';

import { EmailClientService, SendEmailTemplateParams, SendEmailTextParams } from '../../../../src/types';
import { getTemplateId, sendgridService, sgMail } from '../../../../src/services/email/sendgrid';
import { EmailTypes } from '../../../../src/types/enums';
import logger from '../../../../src/log';

describe('Sendgrid Service', () => {
    let emailClientService: EmailClientService;

    beforeAll(() => {
        emailClientService = sendgridService();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Send Text Email', () => {
        const params: SendEmailTextParams = {
            to: [faker.internet.email()],
            from: faker.internet.email(),
            subject: faker.word.words(),
            body: faker.word.words(10),
            reply_to: faker.internet.email(),
            send_at: Date.now(),
        };

        it('should send text email', async () => {
            const spy = vi.spyOn(sgMail, 'send');

            await emailClientService.sendEmailText(params);

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', async () => {
            vi.spyOn(sgMail, 'send');

            const logSpy = vi.spyOn(logger, 'error');

            await emailClientService.sendEmailText(params);

            expect(logSpy).toHaveBeenCalled();
        });
    });

    describe('Send Template Email', () => {
        const params: SendEmailTemplateParams = {
            to: [faker.internet.email()],
            from: faker.internet.email(),
            subject: faker.word.words(),
            emailType: EmailTypes.ConfirmEmail,
            templateData: { otp: '123456' },
            reply_to: faker.internet.email(),
            send_at: Date.now(),
        };

        it('should send text email', async () => {
            const spy = vi.spyOn(sgMail, 'send');

            await emailClientService.sendEmailTemplate(params);

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', async () => {
            vi.spyOn(sgMail, 'send');

            const logSpy = vi.spyOn(logger, 'error');

            await emailClientService.sendEmailTemplate(params);

            expect(logSpy).toHaveBeenCalled();
        });
    });

    describe('Get Template ID', () => {
        it('should get the reset password template id', () => {
            const result = getTemplateId(EmailTypes.ConfirmEmail);

            expect(result).toBeDefined();
        });

        it('should throw error for unsupported template id', () => {
            expect(() => getTemplateId('test' as EmailTypes)).toThrow('Unknown Email Type');
        });
    });
});
