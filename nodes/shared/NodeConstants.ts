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
