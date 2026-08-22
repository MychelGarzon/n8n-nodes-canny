"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannyApi = void 0;
class CannyApi {
    constructor() {
        this.name = 'cannyApi';
        this.displayName = 'Canny API';
        this.documentationUrl = 'https://developers.canny.io/api-reference';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'Found in Canny under Settings > API. Canny expects this as a POST body field, not a header — this credential handles that automatically.',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                body: {
                    apiKey: '={{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: 'https://canny.io/api/v1',
                url: '/boards/list',
                method: 'POST',
                body: {},
            },
        };
    }
}
exports.CannyApi = CannyApi;
//# sourceMappingURL=CannyApi.credentials.js.map