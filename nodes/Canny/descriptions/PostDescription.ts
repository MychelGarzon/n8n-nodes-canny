import { INodeProperties } from 'n8n-workflow';

export const postOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['post'] },
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a post' },
			{ name: 'Get', value: 'get', action: 'Get a post' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many posts' },
			// 'Update', 'Delete', 'Change Status' pending confirmation
			// against the Status Changes docs — see Canny.node.ts TODO.
		],
		default: 'getAll',
	},
];

export const postFields: INodeProperties[] = [
	{
		displayName: 'Board ID',
		name: 'boardID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['post'], operation: ['create'] },
		},
		description: 'The board this post belongs to',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['post'], operation: ['create'] },
		},
	},
	{
		displayName: 'Details',
		name: 'details',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: {
			show: { resource: ['post'], operation: ['create'] },
		},
	},
	{
		displayName: 'Author ID',
		name: 'authorID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['post'], operation: ['create'] },
		},
		description: 'The Canny user ID to post as',
	},
	{
		displayName: 'Post ID',
		name: 'postID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['post'], operation: ['get'] },
		},
	},
	{
		displayName: 'Board ID',
		name: 'boardID',
		type: 'string',
		default: '',
		displayOptions: {
			show: { resource: ['post'], operation: ['getAll'] },
		},
		description: 'Optional — filter posts to a single board. Leave empty to list across all boards.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: { resource: ['post'], operation: ['getAll'] },
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: { resource: ['post'], operation: ['getAll'], returnAll: [false] },
		},
		description: 'Max number of results to return',
	},
];