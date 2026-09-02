import type { IExecuteFunctions } from 'n8n-workflow';
import { buildRequestParams } from '../GenericFunctions';

function mockExecuteFunctions(params: Record<string, unknown>): IExecuteFunctions {
	return {
		getNodeParameter: (name: string, _i: number, fallback?: unknown) => {
			return name in params ? params[name] : fallback;
		},
		getNode: () => ({ name: 'Canny' }),
	} as unknown as IExecuteFunctions;
}

interface HappyPathCase {
	label: string;
	resource: string;
	operation: string;
	params: Record<string, unknown>;
	expectedEndpoint: string;
	expectedBody: Record<string, unknown>;
	expectedResponseKey?: string;
	expectedPaginationStyle?: string;
}

const happyPathCases: HappyPathCase[] = [
	{
		label: 'post create',
		resource: 'post',
		operation: 'create',
		params: {
			boardID: 'board123',
			title: 'My Post',
			details: 'Some details',
			authorID: 'author456',
		},
		expectedEndpoint: '/posts/create',
		expectedBody: {
			boardID: 'board123',
			title: 'My Post',
			details: 'Some details',
			authorID: 'author456',
		},
	},
	{
		label: 'post get',
		resource: 'post',
		operation: 'get',
		params: { postID: 'post789' },
		expectedEndpoint: '/posts/retrieve',
		expectedBody: { id: 'post789' },
	},
	{
		label: 'post getAll with boardID',
		resource: 'post',
		operation: 'getAll',
		params: { boardID: 'board123' },
		expectedEndpoint: '/posts/list',
		expectedBody: { boardID: 'board123' },
		expectedResponseKey: 'posts',
	},
	{
		label: 'post changeStatus',
		resource: 'post',
		operation: 'changeStatus',
		params: {
			postID: 'post789',
			changerID: 'admin1',
			status: 'planned',
			shouldNotifyVoters: true,
			commentValue: 'Great idea!',
		},
		expectedEndpoint: '/posts/change_status',
		expectedBody: {
			postID: 'post789',
			changerID: 'admin1',
			status: 'planned',
			shouldNotifyVoters: true,
			commentValue: 'Great idea!',
		},
	},
	{
		label: 'post delete',
		resource: 'post',
		operation: 'delete',
		params: { postID: 'post789' },
		expectedEndpoint: '/posts/delete',
		expectedBody: { postID: 'post789' },
	},
	{
		label: 'board getAll',
		resource: 'board',
		operation: 'getAll',
		params: {},
		expectedEndpoint: '/boards/list',
		expectedBody: {},
		expectedResponseKey: 'boards',
		expectedPaginationStyle: 'none',
	},
	{
		label: 'board get',
		resource: 'board',
		operation: 'get',
		params: { boardID: 'board123' },
		expectedEndpoint: '/boards/retrieve',
		expectedBody: { id: 'board123' },
	},
	{
		label: 'category get',
		resource: 'category',
		operation: 'get',
		params: { categoryID: 'cat123' },
		expectedEndpoint: '/categories/retrieve',
		expectedBody: { id: 'cat123' },
	},
	{
		label: 'category getAll with boardID',
		resource: 'category',
		operation: 'getAll',
		params: { boardID: 'board123' },
		expectedEndpoint: '/categories/list',
		expectedBody: { boardID: 'board123' },
		expectedResponseKey: 'categories',
	},
	{
		label: 'category create with parentID',
		resource: 'category',
		operation: 'create',
		params: {
			boardID: 'board123',
			name: 'Sub Category',
			parentID: 'parent456',
			subscribeAdmins: false,
		},
		expectedEndpoint: '/categories/create',
		expectedBody: {
			boardID: 'board123',
			name: 'Sub Category',
			parentID: 'parent456',
			subscribeAdmins: false,
		},
	},
	{
		label: 'category delete',
		resource: 'category',
		operation: 'delete',
		params: { categoryID: 'cat123' },
		expectedEndpoint: '/categories/delete',
		expectedBody: { categoryID: 'cat123' },
	},
	{
		label: 'portalComment getAll uses v2 endpoint',
		resource: 'portalComment',
		operation: 'getAll',
		params: { postID: '', boardID: '' },
		expectedEndpoint: 'https://canny.io/api/v2/comments/list',
		expectedBody: {},
		expectedResponseKey: 'items',
		expectedPaginationStyle: 'cursor',
	},
	{
		label: 'idea get',
		resource: 'idea',
		operation: 'get',
		params: { ideaID: 'idea123' },
		expectedEndpoint: '/ideas/retrieve',
		expectedBody: { id: 'idea123' },
	},
	{
		label: 'idea getAll with search and parentID',
		resource: 'idea',
		operation: 'getAll',
		params: { search: 'dark mode', parentID: 'parent789' },
		expectedEndpoint: '/ideas/list',
		expectedBody: { search: 'dark mode', parentID: 'parent789' },
		expectedResponseKey: 'items',
		expectedPaginationStyle: 'cursor',
	},
	{
		label: 'idea delete uses "id" as the key',
		resource: 'idea',
		operation: 'delete',
		params: { ideaID: 'idea123' },
		expectedEndpoint: '/ideas/delete',
		expectedBody: { id: 'idea123' },
	},
];

describe.each(happyPathCases)('buildRequestParams — $label', (testCase) => {
	it('builds the expected endpoint, body, responseKey, and paginationStyle', () => {
		const ctx = mockExecuteFunctions(testCase.params);
		const result = buildRequestParams.call(ctx, testCase.resource, testCase.operation, 0);

		expect(result.endpoint).toBe(testCase.expectedEndpoint);
		expect(result.body).toEqual(testCase.expectedBody);
		if (testCase.expectedResponseKey) {
			expect(result.responseKey).toBe(testCase.expectedResponseKey);
		}
		if (testCase.expectedPaginationStyle) {
			expect(result.paginationStyle).toBe(testCase.expectedPaginationStyle);
		}
	});
});

describe('optional field omission', () => {
	it('post getAll omits boardID when not provided', () => {
		const ctx = mockExecuteFunctions({ boardID: '' });
		const result = buildRequestParams.call(ctx, 'post', 'getAll', 0);
		expect(result.body).toEqual({});
	});

	it('post update omits title/details/eta when not provided', () => {
		const ctx = mockExecuteFunctions({ postID: 'post789', etaPublic: false });
		const result = buildRequestParams.call(ctx, 'post', 'update', 0);
		expect(result.body).toEqual({ postID: 'post789', etaPublic: false });
	});

	it('category getAll omits boardID when not provided', () => {
		const ctx = mockExecuteFunctions({ boardID: '' });
		const result = buildRequestParams.call(ctx, 'category', 'getAll', 0);
		expect(result.body).toEqual({});
	});

	it('category create omits parentID when not provided', () => {
		const ctx = mockExecuteFunctions({
			boardID: 'board123',
			name: 'New Category',
			parentID: '',
			subscribeAdmins: true,
		});
		const result = buildRequestParams.call(ctx, 'category', 'create', 0);
		expect(result.body).toEqual({
			boardID: 'board123',
			name: 'New Category',
			subscribeAdmins: true,
		});
	});
});

describe('invalid operations and resources', () => {
	it.each([
		['post', 'bogus'],
		['board', 'bogus'],
		['category', 'bogus'],
		['idea', 'bogus'],
	])('throws for an unrecognized %s operation "%s"', (resource, operation) => {
		const ctx = mockExecuteFunctions({});
		expect(() => buildRequestParams.call(ctx, resource, operation, 0)).toThrow();
	});

	it('throws for an unrecognized resource', () => {
		const ctx = mockExecuteFunctions({});
		expect(() => buildRequestParams.call(ctx, 'bogus', 'getAll', 0)).toThrow();
	});
});
