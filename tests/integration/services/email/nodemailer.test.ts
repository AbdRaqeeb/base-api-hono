import { beforeAll, describe, expect, it, spyOn } from 'bun:test';
import { faker } from '@faker-js/faker';

import { EmailClientService, SendEmailParams } from '../../../../src/types';
import { nodemailerService, transporter } from '../../../../src/services/email/nodemailer';
import logger from '../../../../src/log';

describe('Nodemailer Service', () => {
    let emailClientService: EmailClientService;

    beforeAll(() => {
        emailClientService = nodemailerService();
    });

    describe('Send Email', () => {
        const params: SendEmailParams = {
            to: [faker.internet.email()],
            from: faker.internet.email(),
            subject: faker.word.words(),
            html: faker.word.words(15),
            reply_to: faker.internet.email(),
        };

        it('should send email', async () => {
            const spy = spyOn(transporter, 'sendMail').mockImplementation(() => ({}) as any);

            await emailClientService.send(params);

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', async () => {
            spyOn(transporter, 'sendMail').mockRejectedValue(() => Promise.reject('error'));

            const logSpy = spyOn(logger, 'error');

            await emailClientService.send(params);

            expect(logSpy).toHaveBeenCalled();
        });
    });
});
