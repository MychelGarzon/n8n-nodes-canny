import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestMethods,
	NodeApiError,
} from 'n8n-workflow';

const BASE_URL = 'https://canny.io/api/v1';

/**
 * Low-level request wrapper for the Canny API.
 * All Canny endpoints are POST + JSON body, and auth (apiKey) is injected
 * automatically by the credential's `authenticate` config — do not add it
 * manually here.
 */
export async function cannyApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const options = {
		method,
		body,
		qs,
		uri: `${BASE_URL}${endpoint}`,
		json: true,
	};

	try {
		return await this.helpers.requestWithAuthentication.call(this, 'cannyApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as any);
	}
}

/**
 * Skip-based pagination, used by v1-style list endpoints (e.g. /posts/list,
 * /boards/list on some params). Confirm per-resource in the docs before
 * relying on this — not every list endpoint necessarily paginates the same
 * way even within "v1".
 *
 * Canny's skip-based responses return { <resourceKey>: [...], hasMore: bool }.
 */
export async function cannyApiRequestAllItemsSkip(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	resourceKey: string,
	endpoint: string,
	body: IDataObject = {},
	limit = 100,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let skip = 0;
	let hasMore = true;

	while (hasMore) {
		const responseData = await cannyApiRequest.call(
			this,
			'POST',
			endpoint,
			{ ...body, limit, skip },
		);

		returnData.push(...(responseData[resourceKey] as IDataObject[]));
		hasMore = responseData.hasMore === true;
		skip += limit;
	}

	return returnData;
}

/**
 * Cursor-based pagination, used by v2-style list endpoints. Confirm which
 * endpoints are actually v2 before wiring a resource to this helper —
 * per the API docs, pagination style varies per endpoint, not globally.
 *
 * Assumed shape: { <resourceKey>: [...], cursor: string | null }.
 * Verify the exact cursor field name per endpoint when you read the docs —
 * this is a placeholder based on common cursor-pagination conventions and
 * has not yet been confirmed against a real v2 response.
 */
export async function cannyApiRequestAllItemsCursor(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	resourceKey: string,
	endpoint: string,
	body: IDataObject = {},
	limit = 100,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let cursor: string | null = null;

	do {
		const requestBody: IDataObject = { ...body, limit };
		if (cursor) {
			requestBody.cursor = cursor;
		}

		const responseData = await cannyApiRequest.call(this, 'POST', endpoint, requestBody);

		returnData.push(...(responseData[resourceKey] as IDataObject[]));
		cursor = (responseData.cursor as string) || null;
	} while (cursor);

	return returnData;
}
