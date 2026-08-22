"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalCommentFields = exports.portalCommentOperations = void 0;
exports.portalCommentOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: { resource: ['portalComment'] },
        },
        options: [
            { name: 'Get Many', value: 'getAll', action: 'Get many portal comments' },
        ],
        default: 'getAll',
    },
];
exports.portalCommentFields = [];
//# sourceMappingURL=PortalCommentDescription.js.map