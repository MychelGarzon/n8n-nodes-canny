import { INodeProperties, IDisplayOptions } from 'n8n-workflow';

export function showFor(resource: string, operations: string[]): IDisplayOptions {
	return {
		show: {
			resource: [resource],
			operation: operations,
		},
	};
}

export function showForWith(
	resource: string,
	operations: string[],
	extra: Record<string, unknown[]>,
): IDisplayOptions {
	return {
		show: {
			resource: [resource],
			operation: operations,
			...extra,
		},
	};
}

/**
 * A required string ID field shown for a single operation — covers the
 * repeated "Comment ID" / "Idea ID" / "Category ID" pattern used for Get
 * and Delete operations across resources.
 */
export function idField(
	displayName: string,
	name: string,
	resource: string,
	operations: string[],
	description?: string,
): INodeProperties {
	const field: INodeProperties = {
		displayName,
		name,
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(resource, operations),
	};
	if (description) field.description = description;
	return field;
}

/**
 * The standard "Return All" toggle shown on a Get Many operation.
 */
export function returnAllField(resource: string): INodeProperties {
	return {
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: showFor(resource, ['getAll']),
		description: 'Whether to return all results or only up to a given limit',
	};
}
export interface OperationOption {
	name: string;
	value: string;
	action: string;
}

/**
 * The standard Operation dropdown shown at the top of a resource's field
 * list. Only the resource name, option list, and default value vary.
 */
export function operationsField(
	resource: string,
	options: OperationOption[],
	defaultValue: string,
): INodeProperties {
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource] } },
		options,
		default: defaultValue,
	};
}
