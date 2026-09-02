import { INodeProperties } from 'n8n-workflow';
import { showFor, showForWith, idField, returnAllField, operationsField } from './DisplayOptions';
import { resourceLocatorField } from '../../shared/NodeConstants';

const RESOURCE = 'portalComment';

export const portalCommentOperations: INodeProperties[] = [
	operationsField(
		RESOURCE,
		[
			{ name: 'Create', value: 'create', action: 'Create a portal comment' },
			{ name: 'Delete', value: 'delete', action: 'Delete a portal comment' },
			{ name: 'Get', value: 'get', action: 'Get a portal comment' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many portal comments' },
		],
		'getAll',
	),
];

export const portalCommentFields: INodeProperties[] = [
	idField('Comment ID', 'commentID', RESOURCE, ['get']),
	{
		displayName: 'Post ID',
		name: 'postID',
		type: 'string',
		default: '',
		displayOptions: showFor(RESOURCE, ['getAll']),
		description: 'Optional — filter comments to a single post',
	},
	resourceLocatorField('Board', 'boardID', 'searchBoards', RESOURCE, ['getAll'], {
		description: 'Optional — filter comments to a single board',
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
	{
		displayName: 'Post ID',
		name: 'postID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(RESOURCE, ['create']),
	},
	{
		displayName: 'Author ID',
		name: 'authorID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(RESOURCE, ['create']),
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: showFor(RESOURCE, ['create']),
		description: 'The comment text. Must be under 2500 characters.',
	},
	{
		displayName: 'Parent Comment ID',
		name: 'parentID',
		type: 'string',
		default: '',
		displayOptions: showFor(RESOURCE, ['create']),
		description: 'Optional — set this if the comment is a reply',
	},
	{
		displayName: 'Internal',
		name: 'internal',
		type: 'boolean',
		default: false,
		displayOptions: showFor(RESOURCE, ['create']),
		description:
			'Whether this comment is only visible internally. Only allowed if the author is a company member.',
	},
	idField('Comment ID', 'commentID', RESOURCE, ['delete']),
];
