import { INodeProperties } from 'n8n-workflow';
import { operationsField } from './DisplayOptions';
import { resourceLocatorField } from '../../shared/NodeConstants';

const RESOURCE = 'board';

export const boardOperations: INodeProperties[] = [
	operationsField(
		RESOURCE,
		[
			{ name: 'Get', value: 'get', action: 'Get a board' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many boards' },
		],
		'getAll',
	),
];

export const boardFields: INodeProperties[] = [
	resourceLocatorField('Board', 'boardID', 'searchBoards', RESOURCE, ['get'], {
		required: true,
	}),
];
