import { beforeAll, describe, expect, it, spyOn } from 'bun:test';
import { faker } from '@faker-js/faker';

import { request } from '../../../../src/lib';
import { newEmailService, newEmailServiceStore } from '../../../../src/services';
import { EmailService, EmailServiceStore, SendEmailParams } from '../../../../src/types';
import { EmailClient, EmailTypes } from '../../../../src/types/enums';

describe('Email Service', () => {
    let emailService: EmailService;
    let emailServiceStore: EmailServiceStore;

    beforeAll(() => {
        emailServiceStore = newEmailServiceStore();
        emailService = newEmailService(emailServiceStore);
    });

    describe('Send Email', () => {
        const emailParams: SendEmailParams = {
            to: [faker.internet.email()],
            from: faker.internet.email(),
            subject: faker.word.words(),
            html: faker.word.words(10),
            reply_to: faker.internet.email(),
            send_at: Date.now(),
        };

        const params = {
            otp: faker.word.words(6),
            otpExpiry: '60 minutes',
        };

        it('should send email', async () => {
            const spy = spyOn(request, 'post');

            await emailService.send(EmailTypes.VerifyEmail, params, emailParams, EmailClient.Sendgrid);

            expect(spy).toHaveBeenCalled();
        });
    });
});
