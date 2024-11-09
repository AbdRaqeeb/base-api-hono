import { beforeAll, describe, expect, it, spyOn } from 'bun:test';
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
            const spy = spyOn(sgMail, 'send').mockImplementation(() => {
                return {} as any;
            });

            await emailClientService.sendEmailText(params);

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', async () => {
            spyOn(sgMail, 'send');

            const logSpy = spyOn(logger, 'error');

            await emailClientService.sendEmailText(params);

            expect(logSpy).toHaveBeenCalled();
        });
    });

    describe('Send Template Email', () => {
        const params: SendEmailTemplateParams = {
            to: [faker.internet.email()],
            from: faker.internet.email(),
            subject: faker.word.words(),
            emailType: EmailTypes.VerifyEmail,
            templateData: { otp: '123456' },
            reply_to: faker.internet.email(),
            send_at: Date.now(),
        };

        it('should send text email', async () => {
            const spy = spyOn(sgMail, 'send').mockImplementation(() => {
                return {} as any;
            });

            await emailClientService.sendEmailTemplate(params);

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', async () => {
            spyOn(sgMail, 'send').mockImplementation(() => {
                return {} as any;
            });

            const logSpy = spyOn(logger, 'error');

            await emailClientService.sendEmailTemplate(params);

            expect(logSpy).toHaveBeenCalled();
        });
    });

    describe('Get Template ID', () => {
        it('should get the reset password template id', () => {
            const result = getTemplateId(EmailTypes.VerifyEmail);

            expect(result).toBeDefined();
        });

        it('should throw error for unsupported template id', () => {
            expect(() => getTemplateId('test' as EmailTypes)).toThrow('Unknown Email Type');
        });
    });
});
