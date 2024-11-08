import { beforeAll, describe, expect, it, spyOn } from 'bun:test';
import { faker } from '@faker-js/faker';

import * as types from '../../../../src/types';
import { newEmailService, newEmailServiceStore } from '../../../../src/services';
import { EmailClient, EmailTypes } from '../../../../src/types/enums';

import { sgMail } from '../../../../src/services/email/sendgrid';
import { mg } from '../../../../src/services/email/mailgun';

describe('Email Service', () => {
    let emailService: types.EmailService;
    let emailServiceStore: types.EmailServiceStore;

    beforeAll(() => {
        emailServiceStore = newEmailServiceStore();
        emailService = newEmailService(emailServiceStore);
    });

    describe('Send Text Email', () => {
        const params: types.SendEmailTextParams = {
            to: [faker.internet.email()],
            from: faker.internet.email(),
            subject: faker.word.words(),
            body: faker.word.words(10),
            reply_to: faker.internet.email(),
            send_at: Date.now(),
        };

        it('should send text email', async () => {
            const spy = spyOn(sgMail, 'send');

            await emailService.sendEmailText(params, EmailClient.Sendgrid);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Send Template Email', () => {
        const params: types.SendEmailTemplateParams = {
            to: [faker.internet.email()],
            from: faker.internet.email(),
            subject: faker.word.words(),
            emailType: EmailTypes.VerifyEmail,
            templateData: { otp: '123456' },
            reply_to: faker.internet.email(),
            send_at: Date.now(),
        };

        it('should send template email', async () => {
            const spy = spyOn(mg.messages, 'create');

            await emailService.sendEmailTemplate(params, EmailClient.Mailgun);

            expect(spy).toHaveBeenCalled();
        });
    });
});
