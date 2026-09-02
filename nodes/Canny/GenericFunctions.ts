import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';

import { NodeApiError, NodeOperationError, sleep } from 'n8n-workflow';

export const BASE_URL = 'https://canny.io/api/v1';

export const PAGINATED_OPERATIONS = ['getAll'];

// Canny doesn't publish a hard rate limit, but a small throttle between
// paginated requests avoids hammering the API during a large Return All.
const MIN_REQUEST_INTERVAL_MS = 250;
let lastRequestTimestamp = 0;

export async function respectRateLimit(): Promise<void> {
	const elapsed = Date.now() - lastRequestTimestamp;
	if (elapsed < MIN_REQUEST_INTERVAL_MS) {
		await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
	}
	lastRequestTimestamp = Date.now();
}

async function requestWithErrorHandling(
	this: IExecuteFunctions,
	options: IHttpRequestOptions,
	i: number,
): Promise<IDataObject> {
	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'cannyApi',
			options,
		)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
			itemIndex: i,
		});
	}
}

export interface RequestParams {
	endpoint: string;
	body: IDataObject;
	responseKey?: string;
	paginationStyle?: 'skip' | 'cursor' | 'none';
}

function buildPostRequest(this: IExecuteFunctions, operation: string, i: number): RequestParams {
	if (operation === 'create') {
		const boardID = this.getNodeParameter('boardID', i) as string;
		const title = this.getNodeParameter('title', i) as string;
		const details = this.getNodeParameter('details', i, '') as string;
		const authorID = this.getNodeParameter('authorID', i) as string;
		return {
			endpoint: '/posts/create',
			body: { boardID, title, details, authorID },
		};
	}
	if (operation === 'get') {
		const postID = this.getNodeParameter('postID', i) as string;
		return { endpoint: '/posts/retrieve', body: { id: postID } };
	}
	if (operation === 'getAll') {
		const boardID = this.getNodeParameter('boardID', i, '') as string;
		const body: IDataObject = {};
		if (boardID) body.boardID = boardID;
		return { endpoint: '/posts/list', body, responseKey: 'posts' };
	}

	throw new NodeOperationError(
		this.getNode(),
		`The post operation "${operation}" is not recognized.`,
		{
			itemIndex: i,
			description: "Select a valid 'Operation' from the dropdown menu to continue.",
		},
	);
}

function buildBoardRequest(this: IExecuteFunctions, operation: string, i: number): RequestParams {
	if (operation === 'get') {
		const boardID = this.getNodeParameter('boardID', i) as string;
		return { endpoint: '/boards/retrieve', body: { id: boardID } };
	}
	if (operation === 'getAll') {
		return {
			endpoint: '/boards/list',
			body: {},
			responseKey: 'boards',
			paginationStyle: 'none',
		};
	}

	throw new NodeOperationError(
		this.getNode(),
		`The board operation "${operation}" is not recognized.`,
		{
			itemIndex: i,
			description: "Select a valid 'Operation' from the dropdown menu to continue.",
		},
	);
}

function buildCategoryRequest(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): RequestParams {
	if (operation === 'get') {
		const categoryID = this.getNodeParameter('categoryID', i) as string;
		return { endpoint: '/categories/retrieve', body: { id: categoryID } };
	}
	if (operation === 'getAll') {
		const boardID = this.getNodeParameter('boardID', i, '') as string;
		const body: IDataObject = {};
		if (boardID) body.boardID = boardID;
		return { endpoint: '/categories/list', body, responseKey: 'categories' };
	}
	if (operation === 'create') {
		const boardID = this.getNodeParameter('boardID', i) as string;
		const name = this.getNodeParameter('name', i) as string;
		const parentID = this.getNodeParameter('parentID', i, '') as string;
		const subscribeAdmins = this.getNodeParameter('subscribeAdmins', i, false) as boolean;
		const body: IDataObject = { boardID, name, subscribeAdmins };
		if (parentID) body.parentID = parentID;
		return { endpoint: '/categories/create', body };
	}
	if (operation === 'delete') {
		const categoryID = this.getNodeParameter('categoryID', i) as string;
		return { endpoint: '/categories/delete', body: { categoryID } };
	}

	throw new NodeOperationError(
		this.getNode(),
		`The category operation "${operation}" is not recognized.`,
		{
			itemIndex: i,
			description: "Select a valid 'Operation' from the dropdown menu to continue.",
		},
	);
}

function buildPortalCommentRequest(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): RequestParams {
	if (operation === 'get') {
		const commentID = this.getNodeParameter('commentID', i) as string;
		return { endpoint: '/comments/retrieve', body: { id: commentID } };
	}
	if (operation === 'getAll') {
		const postID = this.getNodeParameter('postID', i, '') as string;
		const boardID = this.getNodeParameter('boardID', i, '') as string;
		const body: IDataObject = {};
		if (postID) body.postID = postID;
		if (boardID) body.boardID = boardID;
		return {
			endpoint: 'https://canny.io/api/v2/comments/list',
			body,
			responseKey: 'items',
			paginationStyle: 'cursor',
		};
	}
	if (operation === 'create') {
		const postID = this.getNodeParameter('postID', i) as string;
		const authorID = this.getNodeParameter('authorID', i) as string;
		const value = this.getNodeParameter('value', i, '') as string;
		const parentID = this.getNodeParameter('parentID', i, '') as string;
		const internal = this.getNodeParameter('internal', i, false) as boolean;
		const body: IDataObject = { postID, authorID, internal };
		if (value) body.value = value;
		if (parentID) body.parentID = parentID;
		return { endpoint: '/comments/create', body };
	}
	if (operation === 'delete') {
		const commentID = this.getNodeParameter('commentID', i) as string;
		return { endpoint: '/comments/delete', body: { commentID } };
	}

	throw new NodeOperationError(
		this.getNode(),
		`The portal comment operation "${operation}" is not recognized.`,
		{
			itemIndex: i,
			description: "Select a valid 'Operation' from the dropdown menu to continue.",
		},
	);
}

function buildIdeaRequest(this: IExecuteFunctions, operation: string, i: number): RequestParams {
	if (operation === 'get') {
		const ideaID = this.getNodeParameter('ideaID', i) as string;
		return { endpoint: '/ideas/retrieve', body: { id: ideaID } };
	}
	if (operation === 'getAll') {
		const search = this.getNodeParameter('search', i, '') as string;
		const parentID = this.getNodeParameter('parentID', i, '') as string;
		const body: IDataObject = {};
		if (search) body.search = search;
		if (parentID) body.parentID = parentID;
		return {
			endpoint: '/ideas/list',
			body,
			responseKey: 'items',
			paginationStyle: 'cursor',
		};
	}
	if (operation === 'delete') {
		const ideaID = this.getNodeParameter('ideaID', i) as string;
		return { endpoint: '/ideas/delete', body: { id: ideaID } };
	}

	throw new NodeOperationError(
		this.getNode(),
		`The idea operation "${operation}" is not recognized.`,
		{
			itemIndex: i,
			description: "Select a valid 'Operation' from the dropdown menu to continue.",
		},
	);
}

export function buildRequestParams(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	i: number,
): RequestParams {
	if (resource === 'post') return buildPostRequest.call(this, operation, i);
	if (resource === 'board') return buildBoardRequest.call(this, operation, i);
	if (resource === 'category') return buildCategoryRequest.call(this, operation, i);
	if (resource === 'portalComment') return buildPortalCommentRequest.call(this, operation, i);
	if (resource === 'idea') return buildIdeaRequest.call(this, operation, i);

	throw new NodeOperationError(this.getNode(), `The 'Resource' "${resource}" is not recognized.`, {
		itemIndex: i,
		description: "Select a valid 'Resource' from the dropdown menu to continue.",
	});
}

export async function fetchPaginated(
	this: IExecuteFunctions,
	endpoint: string,
	body: IDataObject,
	responseKey: string,
	i: number,
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
	const limit = this.getNodeParameter('limit', i, 50) as number;
	const pageSize = 100; // Canny's documented max per list request

	const collected: IDataObject[] = [];
	let skip = 0;
	let hasMore = true;

	do {
		await respectRateLimit();

		const response = await requestWithErrorHandling.call(
			this,
			{
				method: 'POST',
				url: endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`,
				body: { ...body, limit: pageSize, skip },
				json: true,
			},
			i,
		);

		const pageData = (response[responseKey] as IDataObject[] | undefined) ?? [];
		collected.push(...pageData);
		hasMore = Boolean(response.hasMore);
		skip += pageSize;

		if (!returnAll && collected.length >= limit) break;
	} while (hasMore);

	return returnAll ? collected : collected.slice(0, limit);
}

export async function fetchPaginatedCursor(
	this: IExecuteFunctions,
	endpoint: string,
	body: IDataObject,
	responseKey: string,
	i: number,
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
	const limit = this.getNodeParameter('limit', i, 50) as number;
	const pageSize = returnAll ? 100 : Math.min(limit, 100);

	const collected: IDataObject[] = [];
	let cursor: string | undefined;
	let hasNextPage = true;

	do {
		await respectRateLimit();

		const requestBody: IDataObject = { ...body, limit: pageSize };
		if (cursor) requestBody.cursor = cursor;

		const response = await requestWithErrorHandling.call(
			this,
			{
				method: 'POST',
				url: endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`,
				body: requestBody,
				json: true,
			},
			i,
		);

		const pageData = (response[responseKey] as IDataObject[] | undefined) ?? [];
		collected.push(...pageData);
		hasNextPage = Boolean(response.hasNextPage);
		cursor = response.cursor as string | undefined;

		if (!returnAll && collected.length >= limit) break;
	} while (hasNextPage && cursor);

	return returnAll ? collected : collected.slice(0, limit);
}

export async function fetchSingle(
	this: IExecuteFunctions,
	endpoint: string,
	body: IDataObject,
	i: number,
): Promise<IDataObject> {
	await respectRateLimit();
	return requestWithErrorHandling.call(
		this,
		{
			method: 'POST',
			url: endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`,
			body,
			json: true,
		},
		i,
	);
}

export async function fetchUnpaginatedList(
	this: IExecuteFunctions,
	endpoint: string,
	body: IDataObject,
	responseKey: string,
	i: number,
): Promise<IDataObject[]> {
	await respectRateLimit();

	const response = await requestWithErrorHandling.call(
		this,
		{
			method: 'POST',
			url: endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`,
			body,
			json: true,
		},
		i,
	);

	return (response[responseKey] as IDataObject[] | undefined) ?? [];
}
