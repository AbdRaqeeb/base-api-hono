import build from 'pino-abstract-transport';

type LogRecord = Record<string, unknown>;

type FetchRequestInit = RequestInit & {
    verbose?: boolean;
};

interface TransportOptions {
    endpoint: string;
    batchSize?: number;
    interval?: number;
    headers?: Record<string, string>;
}

const levelMap: Record<number, string> = {
    10: 'TRACE',
    20: 'DEBUG',
    30: 'INFO',
    40: 'WARN',
    50: 'ERROR',
    60: 'FATAL',
};

function formatLogs(records: LogRecord[]): LogRecord[] {
    return records.map((record) => {
        const { level, timestamp, pid, hostname, ...rest } = record;

        return {
            ...rest,
            level: levelMap[record.level as number],
            message: record.msg,
        };
    });
}

export default async function (opts: TransportOptions) {
    const options = {
        batchSize: 10,
        interval: 5000,
        headers: {
            'Content-Type': 'application/json',
        },
        ...opts,
    };

    let batch: LogRecord[] = [];
    let timer: Timer | null = null;

    async function sendLogs(records: LogRecord[]) {
        if (records.length === 0) return;
        const formattedLogs = formatLogs(records);

        try {
            const response = await fetch(options.endpoint, {
                method: 'POST',
                headers: options.headers,
                body: JSON.stringify(formattedLogs),
                verbose: false, // Disable Bun's fetch logging
            } as FetchRequestInit);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error('Failed to send logs:', err);
            throw err;
        }
    }

    return build(
        async function (source) {
            for await (const obj of source) {
                batch.push(obj);

                if (batch.length >= options.batchSize) {
                    const currentBatch = [...batch];
                    batch = [];
                    await sendLogs(currentBatch);
                }

                if (!timer && batch.length > 0) {
                    timer = setTimeout(async () => {
                        const currentBatch = [...batch];
                        batch = [];
                        timer = null;
                        await sendLogs(currentBatch);
                    }, options.interval);
                }
            }
        },
        {
            async close() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                if (batch.length > 0) {
                    await sendLogs(batch);
                    batch = [];
                }
            },
        }
    );
}
