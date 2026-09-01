import { INodeProperties } from 'n8n-workflow';

export const boardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['board'] },
		},
		options: [
			{ name: 'Get', value: 'get', action: 'Get a board' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many boards' },
		],
		default: 'getAll',
	},
];

export const boardFields: INodeProperties[] = [
	{
		displayName: 'Board ID',
		name: 'boardID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['board'], operation: ['get'] },
		},
		description: 'The board\'s unique identifier',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: { resource: ['board'], operation: ['getAll'] },
		},
		description: 'Whether to return all results or only up to a given limit. Canny\'s boards/list endpoint does not paginate — this only controls client-side truncation.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: { resource: ['board'], operation: ['getAll'], returnAll: [false] },
		},
		description: 'Max number of results to return',
	},
];