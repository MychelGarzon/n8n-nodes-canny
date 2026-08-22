import { INodeProperties } from 'n8n-workflow';

// STUB — follow the pattern in PostDescription.ts.
// Fill in real operations once the Board section of the API docs is
// read in full (endpoint names, required fields, pagination style).

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
			{ name: 'Get Many', value: 'getAll', action: 'Get many boards' },
		],
		default: 'getAll',
	},
];

export const boardFields: INodeProperties[] = [
	// TODO: add fields per operation, same pattern as postFields.
];
