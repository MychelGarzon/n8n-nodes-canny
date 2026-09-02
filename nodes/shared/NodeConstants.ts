import { INodeCredentialDescription, INodeProperties } from 'n8n-workflow';

export const CANNY_ICON = {
	light: 'file:../icons/canny.svg' as const,
	dark: 'file:../icons/canny.dark.svg' as const,
};

export const CANNY_CREDENTIALS: INodeCredentialDescription[] = [
	{
		name: 'cannyApi',
		required: true,
	},
];

export interface DropdownOption {
	name: string;
	value: string;
}

/**
 * A standard "options" type dropdown field — covers the shared shape
 * between the top-level Resource selector and the Trigger's Event
 * selector, which are structurally identical (displayName, name, type,
 * noDataExpression, options, default) despite representing unrelated
 * concepts.
 */
export function dropdownField(
	displayName: string,
	name: string,
	options: DropdownOption[],
	defaultValue: string,
	description?: string,
): INodeProperties {
	const field: INodeProperties = {
		displayName,
		name,
		type: 'options',
		noDataExpression: true,
		options,
		default: defaultValue,
	};
	if (description) field.description = description;
	return field;
}
export function resourceLocatorField(
	displayName: string,
	name: string,
	searchListMethod: string,
	resource: string,
	operations: string[],
	options: { required?: boolean; description?: string; placeholder?: string } = {},
): INodeProperties {
	return {
		displayName,
		name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: options.required ?? false,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: `Select a ${displayName}...`,
				typeOptions: {
					searchListMethod,
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: options.placeholder ?? 'e.g. 6a2889c586d7b8843bf4cf01',
			},
		],
		displayOptions: {
			show: { resource: [resource], operation: operations },
		},
		description: options.description,
	};
}
