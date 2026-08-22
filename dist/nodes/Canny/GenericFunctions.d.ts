import { IExecuteFunctions, IHookFunctions, ILoadOptionsFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
export declare function cannyApiRequest(this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: string, body?: IDataObject, qs?: IDataObject): Promise<any>;
export declare function cannyApiRequestAllItemsSkip(this: IExecuteFunctions | ILoadOptionsFunctions, resourceKey: string, endpoint: string, body?: IDataObject, limit?: number): Promise<IDataObject[]>;
export declare function cannyApiRequestAllItemsCursor(this: IExecuteFunctions | ILoadOptionsFunctions, resourceKey: string, endpoint: string, body?: IDataObject, limit?: number): Promise<IDataObject[]>;
