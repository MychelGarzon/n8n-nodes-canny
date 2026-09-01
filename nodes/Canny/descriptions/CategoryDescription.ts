import { INodeProperties } from 'n8n-workflow';

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
			{ name: 'Create', value: 'create', action: 'Create a category' },
			{ name: 'Delete', value: 'delete', action: 'Delete a category' },
			{ name: 'Get', value: 'get', action: 'Get a category' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many categories' },
		],
		default: 'getAll',
	},
];

export const categoryFields: INodeProperties[] = [
	{
		displayName: 'Category ID',
		name: 'categoryID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['category'], operation: ['get'] },
		},
	},
	{
		displayName: 'Board ID',
		name: 'boardID',
		type: 'string',
		default: '',
		displayOptions: {
			show: { resource: ['category'], operation: ['getAll'] },
		},
		description: 'Optional — filter categories to a single board. Leave empty to list across all boards.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: { resource: ['category'], operation: ['getAll'] },
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
			show: { resource: ['category'], operation: ['getAll'], returnAll: [false] },
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Board ID',
		name: 'boardID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['category'], operation: ['create'] },
		},
		description: 'The board to create the category on',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['category'], operation: ['create'] },
		},
		description: 'Must be between 1 and 30 characters long',
	},
	{
		displayName: 'Parent Category ID',
		name: 'parentID',
		type: 'string',
		default: '',
		displayOptions: {
			show: { resource: ['category'], operation: ['create'] },
		},
	},
	{
		displayName: 'Subscribe Admins',
		name: 'subscribeAdmins',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: { resource: ['category'], operation: ['create'] },
		},
	},
	{
		displayName: 'Category ID',
		name: 'categoryID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['category'], operation: ['delete'] },
		},
	},
];