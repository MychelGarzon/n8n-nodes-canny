"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cannyApiRequest = cannyApiRequest;
exports.cannyApiRequestAllItemsSkip = cannyApiRequestAllItemsSkip;
exports.cannyApiRequestAllItemsCursor = cannyApiRequestAllItemsCursor;
const n8n_workflow_1 = require("n8n-workflow");
const BASE_URL = 'https://canny.io/api/v1';
async function cannyApiRequest(method, endpoint, body = {}, qs = {}) {
    const options = {
        method,
        body,
        qs,
        uri: `${BASE_URL}${endpoint}`,
        json: true,
    };
    try {
        return await this.helpers.requestWithAuthentication.call(this, 'cannyApi', options);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
async function cannyApiRequestAllItemsSkip(resourceKey, endpoint, body = {}, limit = 100) {
    const returnData = [];
    let skip = 0;
    let hasMore = true;
    while (hasMore) {
        const responseData = await cannyApiRequest.call(this, 'POST', endpoint, { ...body, limit, skip });
        returnData.push(...responseData[resourceKey]);
        hasMore = responseData.hasMore === true;
        skip += limit;
    }
    return returnData;
}
async function cannyApiRequestAllItemsCursor(resourceKey, endpoint, body = {}, limit = 100) {
    const returnData = [];
    let cursor = null;
    do {
        const requestBody = { ...body, limit };
        if (cursor) {
            requestBody.cursor = cursor;
        }
        const responseData = await cannyApiRequest.call(this, 'POST', endpoint, requestBody);
        returnData.push(...responseData[resourceKey]);
        cursor = responseData.cursor || null;
    } while (cursor);
    return returnData;
}
//# sourceMappingURL=GenericFunctions.js.map