import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class Cronitor implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cronitor',
		name: 'cronitor',
		icon: 'file:cronitor.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with the Cronitor monitoring API. In active development, not yet functional.',
		defaults: {
			name: 'Cronitor',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'cronitorApi',
				required: true,
			},
		],
		properties: [
			// Resource/operation fields go here once build starts:
			// Monitors, Telemetry, Environments, Maintenance Windows (v1 scope)
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Placeholder — real implementation not yet built.
		const items = this.getInputData();
		return [items];
	}
}
