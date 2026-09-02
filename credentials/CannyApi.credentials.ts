import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CannyApi implements ICredentialType {
	name = 'cannyApi';

	displayName = 'Canny API';

	documentationUrl = 'https://developers.canny.io/api-reference';

	icon = {
		light: 'file:../nodes/icons/canny.svg',
		dark: 'file:../nodes/icons/canny.dark.svg',
	} as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Found in Canny under Settings > API. Canny expects this as a POST body field, not a header — this credential handles that automatically.',
		},
	];

	// Canny's auth is non-standard: the API key goes in the JSON body of every
	// POST request as "apiKey", not in an Authorization header. n8n's generic
	// auth mechanism supports body injection directly, so no custom
	// pre-request logic is needed here.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			body: {
				apiKey: '={{$credentials.apiKey}}',
			},
		},
	};

	// boards/list is a cheap, always-available endpoint that needs no
	// pre-existing IDs, which makes it a good credential test target.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://canny.io/api/v1',
			url: '/boards/list',
			method: 'POST',
			body: {},
		},
	};
}
