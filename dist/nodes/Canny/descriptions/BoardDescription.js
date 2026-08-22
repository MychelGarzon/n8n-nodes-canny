"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boardFields = exports.boardOperations = void 0;
exports.boardOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: { resource: ['board'] },
        },
        options: [
            { name: 'Get Many', value: 'getAll', action: 'Get many boards' },
        ],
        default: 'getAll',
    },
];
exports.boardFields = [];
//# sourceMappingURL=BoardDescription.js.map