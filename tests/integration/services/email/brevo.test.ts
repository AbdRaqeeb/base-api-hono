import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';

import { brevoService, brevoInstance as brevo, getTemplateId } from '../../../../src/services/email/brevo';
import { EmailClientService, SendEmailTemplateParams, SendEmailTextParams } from '../../../../src/types';
import { EmailTypes } from '../../../../src/types/enums';
import logger from '../../../../src/log';

describe('Brevo Service', () => {
    let emailService: EmailClientService;

    beforeAll(() => {
        emailService = brevoService();

        vi.spyOn(brevo, 'sendTransacEmail').mockImplementation(async () => {
            return {} as any;
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Send Email Text', () => {
        const data: SendEmailTextParams = {
            from: { email: faker.internet.email(), name: faker.person.fullName() },
            to: [{ email: faker.internet.email(), name: faker.person.fullName() }],
            subject: faker.word.words(3),
            body: faker.word.words(5),
            reply_to: { email: faker.internet.email(), name: faker.person.fullName() },
        };

        it('should send email text', async () => {
            const spy = vi.spyOn(brevo, 'sendTransacEmail');

            await emailService.sendEmailText(data);

            expect(spy).toHaveBeenCalled();
        });

        it('should send email text with to, reply_to and from as string', async () => {
            const spy = vi.spyOn(brevo, 'sendTransacEmail');

            await emailService.sendEmailText({
                from: faker.internet.email(),
                to: faker.internet.email(),
                subject: faker.word.words(3),
                body: faker.word.words(5),
                reply_to: faker.internet.email(),
            });

            expect(spy).toHaveBeenCalled();
        });

        it('should send email text with to as array of string', async () => {
            const spy = vi.spyOn(brevo, 'sendTransacEmail');

            await emailService.sendEmailText({
                from: faker.internet.email(),
                to: [faker.internet.email(), faker.internet.email()],
                subject: faker.word.words(3),
                body: faker.word.words(5),
                reply_to: faker.internet.email(),
            });

            expect(spy).toHaveBeenCalled();
        });

        it('should catch error', async () => {
            vi.spyOn(brevo, 'sendTransacEmail').mockRejectedValue(() => Promise.reject('error'));

            const spy = vi.spyOn(logger, 'error');

            await emailService.sendEmailText(data);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Send Email Template', () => {
        const data: SendEmailTemplateParams = {
            from: { email: faker.internet.email(), name: faker.person.fullName() },
            to: [{ email: faker.internet.email(), name: faker.person.fullName() }],
            subject: faker.word.words(3),
            templateData: { otp: 123 },
            emailType: EmailTypes.ConfirmEmail,
            reply_to: { email: faker.internet.email(), name: faker.person.fullName() },
        };

        it('should send email template', async () => {
            const spy = vi.spyOn(brevo, 'sendTransacEmail');

            await emailService.sendEmailTemplate(data);

            expect(spy).toHaveBeenCalled();
        });

        it('should catch error', async () => {
            vi.spyOn(brevo, 'sendTransacEmail').mockRejectedValue(() => Promise.reject('error'));

            const spy = vi.spyOn(logger, 'error');

            await emailService.sendEmailTemplate(data);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Get Template ID', () => {
        it('should get the reset password template id', () => {
            const result = getTemplateId(EmailTypes.ResetPassword);

            expect(result).toBeDefined();
        });

        it('should throw error for unsupported template id', () => {
            expect(() => getTemplateId('test' as EmailTypes)).toThrow('Unknown Email Type');
        });
    });
});
