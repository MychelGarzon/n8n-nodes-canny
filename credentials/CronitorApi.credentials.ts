import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CronitorApi implements ICredentialType {
	name = 'cronitorApi';
	displayName = 'Cronitor API';
	documentationUrl = 'https://cronitor.io/docs/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Cronitor API key. Used as the HTTP Basic Auth username with a blank password.',
		},
	];

	// HTTP Basic Auth: API key as username, blank password.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.apiKey}}',
				password: '',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://cronitor.io/api',
			url: '/monitors',
			headers: {
				'Cronitor-Version': '2025-11-28',
			},
		},
	};
}
