import { INodeProperties } from 'n8n-workflow';

// STUB — follow the pattern in PostDescription.ts.
// Fill in real operations once the Category section of the API docs is
// read in full (endpoint names, required fields, pagination style).

export const categoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['category'] },
		},
		options: [
			{ name: 'Get Many', value: 'getAll', action: 'Get many categorys' },
		],
		default: 'getAll',
	},
];

export const categoryFields: INodeProperties[] = [
	// TODO: add fields per operation, same pattern as postFields.
];
