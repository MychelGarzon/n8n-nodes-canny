import { INodeProperties } from 'n8n-workflow';

// STUB — follow the pattern in PostDescription.ts.
// Fill in real operations once the Idea section of the API docs is
// read in full (endpoint names, required fields, pagination style).

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
			{ name: 'Get Many', value: 'getAll', action: 'Get many ideas' },
		],
		default: 'getAll',
	},
];

export const ideaFields: INodeProperties[] = [
	// TODO: add fields per operation, same pattern as postFields.
];
