import { beforeAll, describe, expect, it, spyOn } from 'bun:test';
import { faker } from '@faker-js/faker';

import { EmailClientService, SendEmailParams } from '../../../../src/types';
import { sendgridService } from '../../../../src/services/email/sendgrid';
import logger from '../../../../src/log';
import { request } from '../../../../src/lib';

describe('Sendgrid Service', () => {
    let emailClientService: EmailClientService;

    beforeAll(() => {
        emailClientService = sendgridService();
    });

    describe('Send Email', () => {
        const params: SendEmailParams = {
            to: [faker.internet.email()],
            from: faker.internet.email(),
            subject: faker.word.words(),
            html: faker.word.words(10),
            reply_to: faker.internet.email(),
            send_at: Date.now(),
        };

        it('should send email', async () => {
            const spy = spyOn(request, 'post').mockImplementation(() => {
                return {} as any;
            });

            await emailClientService.send(params);

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', async () => {
            spyOn(request, 'post').mockRejectedValue(() => Promise.reject('error'));

            const logSpy = spyOn(logger, 'error');

            await emailClientService.send(params);

            expect(logSpy).toHaveBeenCalled();
        });
    });
});
