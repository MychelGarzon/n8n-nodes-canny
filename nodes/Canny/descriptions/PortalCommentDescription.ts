import { INodeProperties } from 'n8n-workflow';

// STUB — follow the pattern in PostDescription.ts.
// Fill in real operations once the PortalComment section of the API docs is
// read in full (endpoint names, required fields, pagination style).

export const portalCommentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['portalComment'] },
		},
		options: [
			{ name: 'Get Many', value: 'getAll', action: 'Get many portal comments' },
		],
		default: 'getAll',
	},
];

export const portalCommentFields: INodeProperties[] = [
	// TODO: add fields per operation, same pattern as postFields.
];
