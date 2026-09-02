import { INodeProperties } from 'n8n-workflow';
import { idField, operationsField } from './DisplayOptions';

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
	idField('Board ID', 'boardID', RESOURCE, ['get'], "The board's unique identifier"),
];
