import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionTypes } from 'n8n-workflow';
import { fetchResultsForItem, rethrowTypedError } from './GenericFunctions';

import { CANNY_ICON, CANNY_CREDENTIALS, dropdownField } from '../shared/NodeConstants';
import { boardOperations, boardFields } from './descriptions/BoardDescription';
import { categoryOperations, categoryFields } from './descriptions/CategoryDescription';
import { postOperations, postFields } from './descriptions/PostDescription';
import { ideaOperations, ideaFields } from './descriptions/IdeaDescription';
import {
	portalCommentOperations,
	portalCommentFields,
} from './descriptions/PortalCommentDescription';

export class Canny implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Canny',
		name: 'canny',
		icon: CANNY_ICON,
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the Canny API (product feedback, feature requests, roadmap)',
		defaults: { name: 'Canny' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: CANNY_CREDENTIALS,
		properties: [
			dropdownField(
				'Resource',
				'resource',
				[
					{ name: 'Board', value: 'board' },
					{ name: 'Category', value: 'category' },
					{ name: 'Idea', value: 'idea' },
					{ name: 'Portal Comment', value: 'portalComment' },
					{ name: 'Post', value: 'post' },
				],
				'post',
			),
			...boardOperations,
			...boardFields,
			...categoryOperations,
			...categoryFields,
			...postOperations,
			...postFields,
			...ideaOperations,
			...ideaFields,
			...portalCommentOperations,
			...portalCommentFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const results = await fetchResultsForItem.call(this, resource, operation, i);

				returnData.push(
					...results.map((item) => ({
						json: item,
						pairedItem: { item: i },
					})),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}

				rethrowTypedError(this.getNode(), error, i);
			}
		}

		return [returnData];
	}
}
