import { IDisplayOptions } from 'n8n-workflow';

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
