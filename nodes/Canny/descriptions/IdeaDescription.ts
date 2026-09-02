import { INodeProperties } from 'n8n-workflow';

export const ideaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['idea'] },
		},
		options: [
			{ name: 'Delete', value: 'delete', action: 'Delete an idea' },
			{ name: 'Get', value: 'get', action: 'Get an idea' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many ideas' },
		],
		default: 'getAll',
	},
];

export const ideaFields: INodeProperties[] = [
	{
		displayName: 'Idea ID',
		name: 'ideaID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['idea'], operation: ['get'] },
		},
		description: 'Provide either the Idea ID or the URL name',
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		displayOptions: {
			show: { resource: ['idea'], operation: ['getAll'] },
		},
		description:
			'Optional — free-text search. Note: search does not support pagination or sorting.',
	},
	{
		displayName: 'Parent Idea ID',
		name: 'parentID',
		type: 'string',
		default: '',
		displayOptions: {
			show: { resource: ['idea'], operation: ['getAll'] },
		},
		description: 'Optional — only fetch ideas that are children of this idea',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: { resource: ['idea'], operation: ['getAll'] },
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 50,
		displayOptions: {
			show: { resource: ['idea'], operation: ['getAll'], returnAll: [false] },
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Idea ID',
		name: 'ideaID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['idea'], operation: ['delete'] },
		},
	},
];
