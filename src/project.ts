export default {
    name: 'Base API',
    appName: 'base-api',
    logName: 'base-api',
    cookiePrefix: 'base-api',
    sessionTokenName: 'base-api-session',
    redisPrefix: 'ba',
    board: {
        boardTitle: 'Base API Processor',
        boardLogo: {
            path: 'https://s3.varteqar.org/alifhub/logo.png',
            width: '15px',
            height: '15px',
        },
        miscLinks: [{ text: 'Logout', url: '/logout' }],
        favIcon: {
            default: 'favicon.ico',
            alternative: 'https://s3.varteqar.org/alifhub/logo.png',
        },
    },
};
