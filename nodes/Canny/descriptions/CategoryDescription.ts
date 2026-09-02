import { INodeProperties } from 'n8n-workflow';
import { showFor, showForWith, idField, returnAllField, operationsField } from './DisplayOptions';
import { resourceLocatorField } from '../../shared/NodeConstants';

const RESOURCE = 'category';

export const categoryOperations: INodeProperties[] = [
	operationsField(
		RESOURCE,
		[
			{ name: 'Create', value: 'create', action: 'Create a category' },
			{ name: 'Delete', value: 'delete', action: 'Delete a category' },
			{ name: 'Get', value: 'get', action: 'Get a category' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many categories' },
		],
		'getAll',
	),
];

export const categoryFields: INodeProperties[] = [
	idField('Category ID', 'categoryID', RESOURCE, ['get']),
	resourceLocatorField('Board', 'boardID', 'searchBoards', RESOURCE, ['getAll'], {
		description:
			'Optional — filter categories to a single board. Leave empty to list across all boards.',
		kind: 'board',
	}),
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
	resourceLocatorField('Board', 'boardID', 'searchBoards', RESOURCE, ['create'], {
		required: true,
		description: 'The board to create the category on.',
		kind: 'board',
	}),
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(RESOURCE, ['create']),
		description: 'Must be between 1 and 30 characters long',
	},
	{
		displayName: 'Parent Category ID',
		name: 'parentID',
		type: 'string',
		default: '',
		placeholder: 'e.g. 6a2889c586d7b8843bf4cf01',
		displayOptions: showFor(RESOURCE, ['create']),
	},
	{
		displayName: 'Subscribe Admins',
		name: 'subscribeAdmins',
		type: 'boolean',
		default: false,
		displayOptions: showFor(RESOURCE, ['create']),
	},
	idField('Category ID', 'categoryID', RESOURCE, ['delete']),
];
