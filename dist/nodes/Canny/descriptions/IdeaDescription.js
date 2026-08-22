"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ideaFields = exports.ideaOperations = void 0;
exports.ideaOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: { resource: ['idea'] },
        },
        options: [
            { name: 'Get Many', value: 'getAll', action: 'Get many ideas' },
        ],
        default: 'getAll',
    },
];
exports.ideaFields = [];
//# sourceMappingURL=IdeaDescription.js.map