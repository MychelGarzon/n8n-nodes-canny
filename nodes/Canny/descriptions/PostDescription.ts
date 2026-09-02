import { INodeProperties } from 'n8n-workflow';
import { showFor, showForWith, idField, operationsField } from './DisplayOptions';
import { resourceLocatorField } from '../../shared/NodeConstants';

const RESOURCE = 'post';

export const postOperations: INodeProperties[] = [
	operationsField(
		RESOURCE,
		[
			{ name: 'Change Status', value: 'changeStatus', action: 'Change post status' },
			{ name: 'Create', value: 'create', action: 'Create a post' },
			{ name: 'Delete', value: 'delete', action: 'Delete a post' },
			{ name: 'Get', value: 'get', action: 'Get a post' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many posts' },
			{ name: 'Update', value: 'update', action: 'Update a post' },
		],
		'getAll',
	),
];

export const postFields: INodeProperties[] = [
	resourceLocatorField('Board', 'boardID', 'searchBoards', RESOURCE, ['create'], {
		required: true,
		description: 'The board this post belongs to',
	}),
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(RESOURCE, ['create']),
	},
	{
		displayName: 'Details',
		name: 'details',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: showFor(RESOURCE, ['create']),
	},
	{
		displayName: 'Author ID',
		name: 'authorID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(RESOURCE, ['create']),
		description: 'The Canny user ID to post as',
	},
	idField('Post ID', 'postID', RESOURCE, ['get', 'update', 'delete', 'changeStatus']),
	resourceLocatorField('Board', 'boardID', 'searchBoards', RESOURCE, ['getAll'], {
		description:
			'Optional — filter posts to a single board. Leave empty to list across all boards.',
	}),
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
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		displayOptions: showFor(RESOURCE, ['update']),
		description: 'Optional — leave empty to keep the current title',
	},
	{
		displayName: 'Details',
		name: 'details',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: showFor(RESOURCE, ['update']),
		description: 'Optional — leave empty to keep the current details',
	},
	{
		displayName: 'ETA',
		name: 'eta',
		type: 'string',
		default: '',
		placeholder: 'e.g. 06/2026',
		displayOptions: showFor(RESOURCE, ['update']),
		description: 'Optional — estimated completion date, in MM/YYYY format',
	},
	{
		displayName: 'ETA Public',
		name: 'etaPublic',
		type: 'boolean',
		default: false,
		displayOptions: showFor(RESOURCE, ['update']),
		description: 'Whether the ETA should be visible to all users',
	},
	{
		displayName: 'Changer ID',
		name: 'changerID',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(RESOURCE, ['changeStatus']),
		description: 'The Canny user ID of the admin recorded as making this change',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Closed', value: 'closed' },
			{ name: 'Complete', value: 'complete' },
			{ name: 'In Progress', value: 'in progress' },
			{ name: 'Open', value: 'open' },
			{ name: 'Planned', value: 'planned' },
			{ name: 'Under Review', value: 'under review' },
		],
		default: 'planned',
		displayOptions: showFor(RESOURCE, ['changeStatus']),
		description:
			'Your team may have additional custom statuses beyond these defaults — check your Canny settings page',
	},
	{
		displayName: 'Should Notify Voters',
		name: 'shouldNotifyVoters',
		type: 'boolean',
		default: false,
		displayOptions: showFor(RESOURCE, ['changeStatus']),
	},
	{
		displayName: 'Comment Value',
		name: 'commentValue',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		displayOptions: showFor(RESOURCE, ['changeStatus']),
		description: 'Optional — a comment attached to this status change',
	},
];
