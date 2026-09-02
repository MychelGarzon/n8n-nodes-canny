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

function extractCannyErrorMessage(error: unknown): string | undefined {
	const err = error as {
		response?: { body?: unknown };
		cause?: { response?: { body?: unknown } };
	};

	const body = err.response?.body ?? err.cause?.response?.body;

	if (typeof body === 'string' && body.length > 0) {
		return body;
	}
	if (body && typeof body === 'object') {
		const obj = body as IDataObject;
		if (typeof obj.error === 'string') return obj.error;
		if (typeof obj.message === 'string') return obj.message;
	}
	return undefined;
}

function extractStatusCode(error: unknown): number | undefined {
	const err = error as {
		statusCode?: number;
		response?: { statusCode?: number };
		cause?: { response?: { statusCode?: number } };
	};
	return err.statusCode ?? err.response?.statusCode ?? err.cause?.response?.statusCode;
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
		const statusCode = extractStatusCode(error);
		const cannyMessage = extractCannyErrorMessage(error);

		const descriptionParts: string[] = [];
		if (statusCode) descriptionParts.push(`Canny responded with HTTP ${statusCode}.`);
		descriptionParts.push(`Endpoint: ${options.method} ${options.url}`);
		if (cannyMessage) descriptionParts.push(`Canny said: "${cannyMessage}"`);

		throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
			itemIndex: i,
			description: descriptionParts.join(' '),
		});
	}
}
export interface RequestParams {
	endpoint: string;
	body: IDataObject;
	responseKey?: string;
	paginationStyle?: 'skip' | 'cursor' | 'none';
}

// ---------------------------------------------------------------------
// Post
// ---------------------------------------------------------------------

function buildPostCreateRequest(this: IExecuteFunctions, i: number): RequestParams {
	const boardID = this.getNodeParameter('boardID', i, undefined, {
		extractValue: true,
	}) as string;
	const title = this.getNodeParameter('title', i) as string;
	const details = this.getNodeParameter('details', i, '') as string;
	const authorID = this.getNodeParameter('authorID', i, undefined, {
		extractValue: true,
	}) as string;
	return {
		endpoint: '/posts/create',
		body: { boardID, title, details, authorID },
	};
}

function buildPostGetRequest(this: IExecuteFunctions, i: number): RequestParams {
	const postID = this.getNodeParameter('postID', i, undefined, {
		extractValue: true,
	}) as string;
	return { endpoint: '/posts/retrieve', body: { id: postID } };
}

function buildPostGetAllRequest(this: IExecuteFunctions, i: number): RequestParams {
	const boardID = this.getNodeParameter('boardID', i, '', {
		extractValue: true,
	}) as string;
	const body: IDataObject = {};
	if (boardID) body.boardID = boardID;
	return { endpoint: '/posts/list', body, responseKey: 'posts' };
}

function buildPostUpdateRequest(this: IExecuteFunctions, i: number): RequestParams {
	const postID = this.getNodeParameter('postID', i, undefined, {
		extractValue: true,
	}) as string;
	const title = this.getNodeParameter('title', i, '') as string;
	const details = this.getNodeParameter('details', i, '') as string;
	const eta = this.getNodeParameter('eta', i, '') as string;
	const etaPublic = this.getNodeParameter('etaPublic', i, false) as boolean;
	const body: IDataObject = { postID, etaPublic };
	if (title) body.title = title;
	if (details) body.details = details;
	if (eta) body.eta = eta;
	return { endpoint: '/posts/update', body };
}

function buildPostDeleteRequest(this: IExecuteFunctions, i: number): RequestParams {
	const postID = this.getNodeParameter('postID', i, undefined, {
		extractValue: true,
	}) as string;
	return { endpoint: '/posts/delete', body: { postID } };
}

function buildPostChangeStatusRequest(this: IExecuteFunctions, i: number): RequestParams {
	const postID = this.getNodeParameter('postID', i, undefined, {
		extractValue: true,
	}) as string;
	const changerID = this.getNodeParameter('changerID', i, undefined, {
		extractValue: true,
	}) as string;
	const status = this.getNodeParameter('status', i) as string;
	const shouldNotifyVoters = this.getNodeParameter('shouldNotifyVoters', i, false) as boolean;
	const commentValue = this.getNodeParameter('commentValue', i, '') as string;
	const body: IDataObject = { postID, changerID, status, shouldNotifyVoters };
	if (commentValue) body.commentValue = commentValue;
	return { endpoint: '/posts/change_status', body };
}

const POST_OPERATION_BUILDERS: Record<
	string,
	(this: IExecuteFunctions, i: number) => RequestParams
> = {
	create: buildPostCreateRequest,
	get: buildPostGetRequest,
	getAll: buildPostGetAllRequest,
	update: buildPostUpdateRequest,
	delete: buildPostDeleteRequest,
	changeStatus: buildPostChangeStatusRequest,
};

function buildPostRequest(this: IExecuteFunctions, operation: string, i: number): RequestParams {
	const builder = POST_OPERATION_BUILDERS[operation];
	if (!builder) {
		throw new NodeOperationError(
			this.getNode(),
			`The post operation "${operation}" is not recognized.`,
			{
				itemIndex: i,
				description: "Select a valid 'Operation' from the dropdown menu to continue.",
			},
		);
	}
	return builder.call(this, i);
}

// ---------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------

function buildBoardRequest(this: IExecuteFunctions, operation: string, i: number): RequestParams {
	if (operation === 'get') {
		const boardID = this.getNodeParameter('boardID', i, undefined, {
			extractValue: true,
		}) as string;
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

// ---------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------

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
		const boardID = this.getNodeParameter('boardID', i, '', {
			extractValue: true,
		}) as string;
		const body: IDataObject = {};
		if (boardID) body.boardID = boardID;
		return { endpoint: '/categories/list', body, responseKey: 'categories' };
	}
	if (operation === 'create') {
		const boardID = this.getNodeParameter('boardID', i, undefined, {
			extractValue: true,
		}) as string;
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

// ---------------------------------------------------------------------
// Portal Comment
// ---------------------------------------------------------------------

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
		const postID = this.getNodeParameter('postID', i, '', {
			extractValue: true,
		}) as string;
		const boardID = this.getNodeParameter('boardID', i, '', {
			extractValue: true,
		}) as string;
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
		const postID = this.getNodeParameter('postID', i, undefined, {
			extractValue: true,
		}) as string;
		const authorID = this.getNodeParameter('authorID', i, undefined, {
			extractValue: true,
		}) as string;
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

// ---------------------------------------------------------------------
// Idea
// ---------------------------------------------------------------------

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

// ---------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------

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

// ---------------------------------------------------------------------
// Fetching / pagination
// ---------------------------------------------------------------------

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

export async function fetchResultsForItem(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	i: number,
): Promise<IDataObject[]> {
	const { endpoint, body, responseKey, paginationStyle } = buildRequestParams.call(
		this,
		resource,
		operation,
		i,
	);

	if (!PAGINATED_OPERATIONS.includes(operation) || !responseKey) {
		const single = await fetchSingle.call(this, endpoint, body, i);
		return [single];
	}

	if (paginationStyle === 'cursor') {
		return fetchPaginatedCursor.call(this, endpoint, body, responseKey, i);
	}
	if (paginationStyle === 'none') {
		return fetchUnpaginatedList.call(this, endpoint, body, responseKey, i);
	}
	return fetchPaginated.call(this, endpoint, body, responseKey, i);
}

export function rethrowTypedError(
	node: ReturnType<IExecuteFunctions['getNode']>,
	error: unknown,
	i: number,
): never {
	if (error instanceof NodeOperationError) {
		throw new NodeOperationError(node, error.message, {
			itemIndex: i,
			description: error.description ?? undefined,
		});
	}
	if (error instanceof NodeApiError) {
		throw new NodeApiError(node, error as unknown as JsonObject, { itemIndex: i });
	}
	throw new NodeApiError(node, error as unknown as JsonObject, { itemIndex: i });
}
