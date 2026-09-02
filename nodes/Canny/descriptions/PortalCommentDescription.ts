import { INodeProperties } from 'n8n-workflow';
import { showFor, showForWith } from './DisplayOptions';

const RESOURCE = 'portalComment';

export const portalCommentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a portal comment' },
			{ name: 'Delete', value: 'delete', action: 'Delete a portal comment' },
			{ name: 'Get', value: 'get', action: 'Get a portal comment' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many portal comments' },
		],
		default: 'getAll',
	},
];

export const portalCommentFields: INodeProperties[] = [
	{
		displayName: 'Comment ID',
		name: 'commentID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(RESOURCE, ['get']),
	},
	{
		displayName: 'Post ID',
		name: 'postID',
		type: 'string',
		default: '',
		displayOptions: showFor(RESOURCE, ['getAll']),
		description: 'Optional — filter comments to a single post',
	},
	{
		displayName: 'Board ID',
		name: 'boardID',
		type: 'string',
		default: '',
		displayOptions: showFor(RESOURCE, ['getAll']),
		description: 'Optional — filter comments to a single board',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: showFor(RESOURCE, ['getAll']),
		description: 'Whether to return all results or only up to a given limit',
	},
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
	{
		displayName: 'Comment ID',
		name: 'commentID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(RESOURCE, ['delete']),
	},
];
