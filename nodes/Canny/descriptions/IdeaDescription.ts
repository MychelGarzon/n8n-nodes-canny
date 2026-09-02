import { INodeProperties } from 'n8n-workflow';
import { showFor, showForWith, idField, returnAllField, operationsField } from './DisplayOptions';

const RESOURCE = 'idea';

export const ideaOperations: INodeProperties[] = [
	operationsField(
		RESOURCE,
		[
			{ name: 'Delete', value: 'delete', action: 'Delete an idea' },
			{ name: 'Get', value: 'get', action: 'Get an idea' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many ideas' },
		],
		'getAll',
	),
];

export const ideaFields: INodeProperties[] = [
	idField('Idea ID', 'ideaID', RESOURCE, ['get'], 'Provide either the Idea ID or the URL name'),
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		placeholder: 'e.g. dark mode',
		displayOptions: showFor(RESOURCE, ['getAll']),
		description:
			'Optional — free-text search. Note: search does not support pagination or sorting.',
	},
	{
		displayName: 'Parent Idea ID',
		name: 'parentID',
		type: 'string',
		default: '',
		placeholder: 'e.g. 6a2889c586d7b8843bf4cf01',
		displayOptions: showFor(RESOURCE, ['getAll']),
		description: 'Optional — only fetch ideas that are children of this idea',
	},
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
	idField('Idea ID', 'ideaID', RESOURCE, ['delete']),
];
