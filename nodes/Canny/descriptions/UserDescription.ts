import { INodeProperties } from 'n8n-workflow';
import { showForWith, returnAllField, operationsField } from './DisplayOptions';

const RESOURCE = 'user';

export const userOperations: INodeProperties[] = [
	operationsField(
		RESOURCE,
		[{ name: 'Get Many', value: 'getAll', action: 'Get many users' }],
		'getAll',
	),
];

export const userFields: INodeProperties[] = [
	returnAllField(RESOURCE),
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 50,
		displayOptions: showForWith(RESOURCE, ['getAll'], { returnAll: [false] }),
		description: 'Max number of results to return',
	},
];
