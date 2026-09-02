import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionTypes,
} from 'n8n-workflow';
import { createHmac, timingSafeEqual } from 'node:crypto';

import { CANNY_ICON, CANNY_CREDENTIALS, dropdownField } from '../shared/NodeConstants';

export class CannyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Canny Trigger',
		name: 'cannyTrigger',
		icon: CANNY_ICON,
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description:
			'Starts the workflow when a Canny event occurs. Canny webhooks must be registered manually in your Canny dashboard under Settings > API — this node cannot register the webhook URL for you.',
		defaults: { name: 'Canny Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: CANNY_CREDENTIALS,
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					"Canny has no API for registering webhooks — copy this node's Webhook URL and add it manually in your Canny dashboard under Settings > API.",
				name: 'notice',
				type: 'notice',
				default: '',
			},
			dropdownField(
				'Event',
				'event',
				[
					{ name: 'Comment Created', value: 'comment.created' },
					{ name: 'Comment Deleted', value: 'comment.deleted' },
					{ name: 'Comment Edited', value: 'comment.edited' },
					{ name: 'Post Created', value: 'post.created' },
					{ name: 'Post Deleted', value: 'post.deleted' },
					{ name: 'Post Edited', value: 'post.edited' },
					{ name: 'Post Jira Issue Linked', value: 'post.jira_issue_linked' },
					{ name: 'Post Jira Issue Unlinked', value: 'post.jira_issue_unlinked' },
					{ name: 'Post Status Changed', value: 'post.status_changed' },
					{ name: 'Post Tag Added', value: 'post.tag_added' },
					{ name: 'Post Tag Removed', value: 'post.tag_removed' },
					{ name: 'Vote Created', value: 'vote.created' },
					{ name: 'Vote Deleted', value: 'vote.deleted' },
				],
				'post.created',
				'Canny sends every subscribed event type to the same webhook URL. This filter drops any event that does not match your selection.',
			),
		],
	};

	// Canny has no API endpoint for creating, listing, or deleting webhooks —
	// registration only happens through the dashboard (Settings > API). These
	// lifecycle hooks are deliberate no-ops, not unfinished stubs: returning
	// true from checkExists tells n8n a webhook already exists so it never
	// attempts to auto-register one, and create/delete are no-ops since there
	// is nothing for n8n to call.
	webhookMethods = {
		default: {
			checkExists: async function (this: IHookFunctions): Promise<boolean> {
				return true;
			},
			create: async function (this: IHookFunctions): Promise<boolean> {
				return true;
			},
			delete: async function (this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const headers = this.getHeaderData() as Record<string, string>;
		const bodyData = this.getBodyData();

		const nonce = headers['canny-nonce'];
		const signature = headers['canny-signature'];

		if (!nonce || !signature) {
			const res = this.getResponseObject();
			res.status(401).json({ message: 'Missing Canny signature headers' });
			return { noWebhookResponse: true };
		}

		const credentials = await this.getCredentials('cannyApi');
		const apiKey = credentials.apiKey as string;

		const expectedSignature = createHmac('sha256', apiKey).update(nonce).digest('base64');

		const expectedBuffer = Buffer.from(expectedSignature);
		const actualBuffer = Buffer.from(signature);
		const signaturesMatch =
			expectedBuffer.length === actualBuffer.length &&
			timingSafeEqual(expectedBuffer, actualBuffer);

		if (!signaturesMatch) {
			const res = this.getResponseObject();
			res.status(401).json({ message: 'Invalid Canny webhook signature' });
			return { noWebhookResponse: true };
		}

		const selectedEvent = this.getNodeParameter('event') as string;
		const eventType = (bodyData as { type?: string }).type;

		if (eventType !== selectedEvent) {
			return { noWebhookResponse: true };
		}

		return {
			workflowData: [this.helpers.returnJsonArray(bodyData)],
		};
	}
}
