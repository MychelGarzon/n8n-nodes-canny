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

describe('buildRequestParams — post', () => {
	it('builds a create request with all fields', () => {
		const ctx = mockExecuteFunctions({
			boardID: 'board123',
			title: 'My Post',
			details: 'Some details',
			authorID: 'author456',
		});

		const result = buildRequestParams.call(ctx, 'post', 'create', 0);

		expect(result.endpoint).toBe('/posts/create');
		expect(result.body).toEqual({
			boardID: 'board123',
			title: 'My Post',
			details: 'Some details',
			authorID: 'author456',
		});
	});

	it('builds a get request using the post ID as "id"', () => {
		const ctx = mockExecuteFunctions({ postID: 'post789' });
		const result = buildRequestParams.call(ctx, 'post', 'get', 0);

		expect(result.endpoint).toBe('/posts/retrieve');
		expect(result.body).toEqual({ id: 'post789' });
	});

	it('omits boardID from getAll body when not provided', () => {
		const ctx = mockExecuteFunctions({ boardID: '' });
		const result = buildRequestParams.call(ctx, 'post', 'getAll', 0);

		expect(result.endpoint).toBe('/posts/list');
		expect(result.body).toEqual({});
		expect(result.responseKey).toBe('posts');
	});

	it('includes boardID in getAll body when provided', () => {
		const ctx = mockExecuteFunctions({ boardID: 'board123' });
		const result = buildRequestParams.call(ctx, 'post', 'getAll', 0);

		expect(result.body).toEqual({ boardID: 'board123' });
	});

	it('omits optional fields from update body when not provided', () => {
		const ctx = mockExecuteFunctions({ postID: 'post789', etaPublic: false });
		const result = buildRequestParams.call(ctx, 'post', 'update', 0);

		expect(result.endpoint).toBe('/posts/update');
		expect(result.body).toEqual({ postID: 'post789', etaPublic: false });
	});

	it('builds a changeStatus request with all fields', () => {
		const ctx = mockExecuteFunctions({
			postID: 'post789',
			changerID: 'admin1',
			status: 'planned',
			shouldNotifyVoters: true,
			commentValue: 'Great idea!',
		});

		const result = buildRequestParams.call(ctx, 'post', 'changeStatus', 0);

		expect(result.endpoint).toBe('/posts/change_status');
		expect(result.body).toEqual({
			postID: 'post789',
			changerID: 'admin1',
			status: 'planned',
			shouldNotifyVoters: true,
			commentValue: 'Great idea!',
		});
	});

	it('builds a delete request', () => {
		const ctx = mockExecuteFunctions({ postID: 'post789' });
		const result = buildRequestParams.call(ctx, 'post', 'delete', 0);

		expect(result.endpoint).toBe('/posts/delete');
		expect(result.body).toEqual({ postID: 'post789' });
	});

	it('throws NodeOperationError for an unrecognized post operation', () => {
		const ctx = mockExecuteFunctions({});
		expect(() => buildRequestParams.call(ctx, 'post', 'bogus', 0)).toThrow();
	});
});

describe('buildRequestParams — board', () => {
	it('builds a getAll request with no body and "none" pagination', () => {
		const ctx = mockExecuteFunctions({});
		const result = buildRequestParams.call(ctx, 'board', 'getAll', 0);

		expect(result.endpoint).toBe('/boards/list');
		expect(result.body).toEqual({});
		expect(result.paginationStyle).toBe('none');
	});

	it('builds a get request using boardID as "id"', () => {
		const ctx = mockExecuteFunctions({ boardID: 'board123' });
		const result = buildRequestParams.call(ctx, 'board', 'get', 0);

		expect(result.endpoint).toBe('/boards/retrieve');
		expect(result.body).toEqual({ id: 'board123' });
	});
});

describe('buildRequestParams — category', () => {
	it('builds a get request', () => {
		const ctx = mockExecuteFunctions({ categoryID: 'cat123' });
		const result = buildRequestParams.call(ctx, 'category', 'get', 0);

		expect(result.endpoint).toBe('/categories/retrieve');
		expect(result.body).toEqual({ id: 'cat123' });
	});

	it('builds a getAll request, omitting boardID when not provided', () => {
		const ctx = mockExecuteFunctions({ boardID: '' });
		const result = buildRequestParams.call(ctx, 'category', 'getAll', 0);

		expect(result.endpoint).toBe('/categories/list');
		expect(result.body).toEqual({});
		expect(result.responseKey).toBe('categories');
	});

	it('includes boardID in getAll body when provided', () => {
		const ctx = mockExecuteFunctions({ boardID: 'board123' });
		const result = buildRequestParams.call(ctx, 'category', 'getAll', 0);

		expect(result.body).toEqual({ boardID: 'board123' });
	});

	it('builds a create request, omitting parentID when not provided', () => {
		const ctx = mockExecuteFunctions({
			boardID: 'board123',
			name: 'New Category',
			parentID: '',
			subscribeAdmins: true,
		});
		const result = buildRequestParams.call(ctx, 'category', 'create', 0);

		expect(result.endpoint).toBe('/categories/create');
		expect(result.body).toEqual({
			boardID: 'board123',
			name: 'New Category',
			subscribeAdmins: true,
		});
	});

	it('includes parentID in create body when provided', () => {
		const ctx = mockExecuteFunctions({
			boardID: 'board123',
			name: 'Sub Category',
			parentID: 'parent456',
			subscribeAdmins: false,
		});
		const result = buildRequestParams.call(ctx, 'category', 'create', 0);

		expect(result.body).toEqual({
			boardID: 'board123',
			name: 'Sub Category',
			parentID: 'parent456',
			subscribeAdmins: false,
		});
	});

	it('builds a delete request', () => {
		const ctx = mockExecuteFunctions({ categoryID: 'cat123' });
		const result = buildRequestParams.call(ctx, 'category', 'delete', 0);

		expect(result.endpoint).toBe('/categories/delete');
		expect(result.body).toEqual({ categoryID: 'cat123' });
	});

	it('throws for an unrecognized category operation', () => {
		const ctx = mockExecuteFunctions({});
		expect(() => buildRequestParams.call(ctx, 'category', 'bogus', 0)).toThrow();
	});
});

describe('buildRequestParams — portalComment', () => {
	it('uses the v2 endpoint for getAll', () => {
		const ctx = mockExecuteFunctions({ postID: '', boardID: '' });
		const result = buildRequestParams.call(ctx, 'portalComment', 'getAll', 0);

		expect(result.endpoint).toBe('https://canny.io/api/v2/comments/list');
		expect(result.paginationStyle).toBe('cursor');
	});
});

describe('buildRequestParams — idea', () => {
	it('builds a get request', () => {
		const ctx = mockExecuteFunctions({ ideaID: 'idea123' });
		const result = buildRequestParams.call(ctx, 'idea', 'get', 0);

		expect(result.endpoint).toBe('/ideas/retrieve');
		expect(result.body).toEqual({ id: 'idea123' });
	});

	it('builds a getAll request with cursor pagination, no filters', () => {
		const ctx = mockExecuteFunctions({ search: '', parentID: '' });
		const result = buildRequestParams.call(ctx, 'idea', 'getAll', 0);

		expect(result.endpoint).toBe('/ideas/list');
		expect(result.body).toEqual({});
		expect(result.responseKey).toBe('items');
		expect(result.paginationStyle).toBe('cursor');
	});

	it('includes search and parentID in getAll body when provided', () => {
		const ctx = mockExecuteFunctions({ search: 'dark mode', parentID: 'parent789' });
		const result = buildRequestParams.call(ctx, 'idea', 'getAll', 0);

		expect(result.body).toEqual({ search: 'dark mode', parentID: 'parent789' });
	});

	it('builds a delete request using "id" as the key', () => {
		const ctx = mockExecuteFunctions({ ideaID: 'idea123' });
		const result = buildRequestParams.call(ctx, 'idea', 'delete', 0);

		expect(result.endpoint).toBe('/ideas/delete');
		expect(result.body).toEqual({ id: 'idea123' });
	});

	it('throws for an unrecognized idea operation', () => {
		const ctx = mockExecuteFunctions({});
		expect(() => buildRequestParams.call(ctx, 'idea', 'bogus', 0)).toThrow();
	});
});

describe('buildRequestParams — unknown resource', () => {
	it('throws for an unrecognized resource', () => {
		const ctx = mockExecuteFunctions({});
		expect(() => buildRequestParams.call(ctx, 'bogus', 'getAll', 0)).toThrow();
	});
});
