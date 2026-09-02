import { createHmac } from 'node:crypto';
import type { IWebhookFunctions } from 'n8n-workflow';
import { CannyTrigger } from '../../CannyTrigger/CannyTrigger.node';

const FAKE_HMAC_KEY = 'unit-test-signing-value-abc';

function mockWebhookFunctions(options: {
	headers?: Record<string, string>;
	body?: unknown;
	event?: string;
}): { ctx: IWebhookFunctions; statusMock: jest.Mock; jsonMock: jest.Mock } {
	const jsonMock = jest.fn();
	const statusMock = jest.fn(() => ({ json: jsonMock }));

	const ctx = {
		getHeaderData: () => options.headers ?? {},
		getBodyData: () => options.body ?? {},
		getResponseObject: () => ({ status: statusMock }),
		getCredentials: async () => ({ apiKey: FAKE_HMAC_KEY }),
		getNodeParameter: () => options.event ?? 'post.created',
		helpers: {
			returnJsonArray: (data: unknown) => [{ json: data }],
		},
	} as unknown as IWebhookFunctions;

	return { ctx, statusMock, jsonMock };
}

function signNonce(nonce: string): string {
	return createHmac('sha256', FAKE_HMAC_KEY).update(nonce).digest('base64');
}

describe('CannyTrigger.webhook', () => {
	const trigger = new CannyTrigger();

	it('rejects a request with missing signature headers', async () => {
		const { ctx, statusMock, jsonMock } = mockWebhookFunctions({ headers: {} });

		const result = await trigger.webhook.call(ctx);

		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Missing Canny signature headers' });
		expect(result).toEqual({ noWebhookResponse: true });
	});

	it('rejects a request with an invalid signature', async () => {
		const { ctx, statusMock, jsonMock } = mockWebhookFunctions({
			headers: { 'canny-nonce': 'abc123', 'canny-signature': 'wrong-signature' },
			body: { type: 'post.created' },
		});

		const result = await trigger.webhook.call(ctx);

		expect(statusMock).toHaveBeenCalledWith(401);
		expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid Canny webhook signature' });
		expect(result).toEqual({ noWebhookResponse: true });
	});

	it('accepts a validly signed request but drops it if the event does not match', async () => {
		const nonce = 'abc123';
		const { ctx } = mockWebhookFunctions({
			headers: { 'canny-nonce': nonce, 'canny-signature': signNonce(nonce) },
			body: { type: 'comment.created' },
			event: 'post.created',
		});

		const result = await trigger.webhook.call(ctx);

		expect(result).toEqual({ noWebhookResponse: true });
	});

	it('accepts a validly signed request and triggers the workflow when the event matches', async () => {
		const nonce = 'abc123';
		const bodyData = { type: 'post.created', id: 'post789' };
		const { ctx } = mockWebhookFunctions({
			headers: { 'canny-nonce': nonce, 'canny-signature': signNonce(nonce) },
			body: bodyData,
			event: 'post.created',
		});

		const result = await trigger.webhook.call(ctx);

		expect(result).toEqual({ workflowData: [[{ json: bodyData }]] });
	});
});
