import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	IDataObject,
} from 'n8n-workflow';

import { NodeConnectionTypes } from 'n8n-workflow';
import { fetchResultsForItem, rethrowTypedError } from './GenericFunctions';
import { userOperations, userFields } from './descriptions/UserDescription';

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
					{ name: 'User', value: 'user' },
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
			...userOperations,
			...userFields,
		],
	};

	methods = {
		listSearch: {
			async searchBoards(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'cannyApi', {
					method: 'POST',
					url: 'https://canny.io/api/v1/boards/list',
					body: {},
					json: true,
				});

				const boards = Array.isArray(response.boards)
					? (response.boards as Array<{ name: string; id: string }>)
					: [];

				return {
					results: boards.map((board) => ({
						name: board.name,
						value: board.id,
					})),
				};
			},
			async searchCategories(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const boardID = this.getCurrentNodeParameter('boardID', {
					extractValue: true,
				}) as string;

				const body: IDataObject = boardID ? { boardID } : {};

				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'cannyApi', {
					method: 'POST',
					url: 'https://canny.io/api/v1/categories/list',
					body,
					json: true,
				});

				const categories = Array.isArray(response.categories)
					? (response.categories as Array<{ name: string; id: string }>)
					: [];

				return {
					results: categories.map((category) => ({
						name: category.name,
						value: category.id,
					})),
				};
			},
			async searchPosts(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				let boardID = '';
				try {
					boardID = this.getCurrentNodeParameter('boardID', {
						extractValue: true,
					}) as string;
				} catch {
					// boardID isn't present on every operation that uses this
					// picker (e.g. Post Get/Update/Delete/Change Status) —
					// that's fine, just search across all boards instead.
				}

				const body: IDataObject = { limit: 100 };
				if (boardID) body.boardID = boardID;
				if (filter) body.search = filter;

				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'cannyApi', {
					method: 'POST',
					url: 'https://canny.io/api/v1/posts/list',
					body,
					json: true,
				});

				const posts = Array.isArray(response.posts)
					? (response.posts as Array<{ title: string; id: string }>)
					: [];

				return {
					results: posts.map((post) => ({
						name: post.title,
						value: post.id,
					})),
				};
			},
			async searchUsers(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'cannyApi', {
					method: 'POST',
					url: 'https://canny.io/api/v2/users/list',
					body: { limit: 100 },
					json: true,
				});

				const users = Array.isArray(response.users)
					? (response.users as Array<{ name: string; email: string | null; id: string }>)
					: [];

				const filtered = filter
					? users.filter(
							(user) =>
								user.name.toLowerCase().includes(filter.toLowerCase()) ||
								(user.email ?? '').toLowerCase().includes(filter.toLowerCase()),
						)
					: users;

				return {
					results: filtered.map((user) => ({
						name: user.email ? `${user.name} (${user.email})` : user.name,
						value: user.id,
					})),
				};
			},
		},
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
