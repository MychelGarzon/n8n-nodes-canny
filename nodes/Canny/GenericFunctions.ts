import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestOptions,
  JsonObject,
} from "n8n-workflow";

import { NodeApiError, NodeOperationError, sleep } from "n8n-workflow";

export const BASE_URL = "https://canny.io/api/v1";

export const PAGINATED_OPERATIONS = ["getAll"];

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
      "cannyApi",
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
}

function buildPostRequest(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): RequestParams {
  if (operation === "create") {
    const boardID = this.getNodeParameter("boardID", i) as string;
    const title = this.getNodeParameter("title", i) as string;
    const details = this.getNodeParameter("details", i, "") as string;
    const authorID = this.getNodeParameter("authorID", i) as string;
    return {
      endpoint: "/posts/create",
      body: { boardID, title, details, authorID },
    };
  }
  if (operation === "get") {
    const postID = this.getNodeParameter("postID", i) as string;
    return { endpoint: "/posts/retrieve", body: { id: postID } };
  }
  if (operation === "getAll") {
    const boardID = this.getNodeParameter("boardID", i, "") as string;
    const body: IDataObject = {};
    if (boardID) body.boardID = boardID;
    return { endpoint: "/posts/list", body, responseKey: "posts" };
  }

  throw new NodeOperationError(
    this.getNode(),
    `The post operation "${operation}" is not recognized.`,
    {
      itemIndex: i,
      description:
        "Select a valid 'Operation' from the dropdown menu to continue.",
    },
  );
}

export function buildRequestParams(
  this: IExecuteFunctions,
  resource: string,
  operation: string,
  i: number,
): RequestParams {
  if (resource === "post") return buildPostRequest.call(this, operation, i);

  throw new NodeOperationError(
    this.getNode(),
    `The 'Resource' "${resource}" is not recognized.`,
    {
      itemIndex: i,
      description:
        "Select a valid 'Resource' from the dropdown menu to continue.",
    },
  );
}

export async function fetchPaginated(
  this: IExecuteFunctions,
  endpoint: string,
  body: IDataObject,
  responseKey: string,
  i: number,
): Promise<IDataObject[]> {
  const returnAll = this.getNodeParameter("returnAll", i, false) as boolean;
  const limit = this.getNodeParameter("limit", i, 50) as number;
  const pageSize = 100; // Canny's documented max per list request

  const collected: IDataObject[] = [];
  let skip = 0;
  let hasMore = true;

  do {
    await respectRateLimit();

    const response = await requestWithErrorHandling.call(
      this,
      {
        method: "POST",
        url: `${BASE_URL}${endpoint}`,
        body: { ...body, limit: pageSize, skip },
        json: true,
      },
      i,
    );

    const pageData =
      (response[responseKey] as IDataObject[] | undefined) ?? [];
    collected.push(...pageData);
    hasMore = Boolean(response.hasMore);
    skip += pageSize;

    if (!returnAll && collected.length >= limit) break;
  } while (hasMore);

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
      method: "POST",
      url: `${BASE_URL}${endpoint}`,
      body,
      json: true,
    },
    i,
  );
}