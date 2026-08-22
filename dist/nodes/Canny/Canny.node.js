"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Canny = void 0;
const GenericFunctions_1 = require("./GenericFunctions");
const BoardDescription_1 = require("./descriptions/BoardDescription");
const CategoryDescription_1 = require("./descriptions/CategoryDescription");
const PostDescription_1 = require("./descriptions/PostDescription");
const IdeaDescription_1 = require("./descriptions/IdeaDescription");
const PortalCommentDescription_1 = require("./descriptions/PortalCommentDescription");
class Canny {
    constructor() {
        this.description = {
            displayName: "Canny",
            name: "canny",
            icon: "file:canny.svg",
            group: ["transform"],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: "Consume the Canny API (product feedback, feature requests, roadmap)",
            defaults: { name: "Canny" },
            inputs: ["main"],
            outputs: ["main"],
            usableAsTool: true,
            credentials: [
                {
                    name: "cannyApi",
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: "Resource",
                    name: "resource",
                    type: "options",
                    noDataExpression: true,
                    options: [
                        { name: "Board", value: "board" },
                        { name: "Category", value: "category" },
                        { name: "Idea", value: "idea" },
                        { name: "Portal Comment", value: "portalComment" },
                        { name: "Post", value: "post" },
                    ],
                    default: "post",
                },
                ...BoardDescription_1.boardOperations,
                ...BoardDescription_1.boardFields,
                ...CategoryDescription_1.categoryOperations,
                ...CategoryDescription_1.categoryFields,
                ...PostDescription_1.postOperations,
                ...PostDescription_1.postFields,
                ...IdeaDescription_1.ideaOperations,
                ...IdeaDescription_1.ideaFields,
                ...PortalCommentDescription_1.portalCommentOperations,
                ...PortalCommentDescription_1.portalCommentFields,
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter("resource", 0);
        const operation = this.getNodeParameter("operation", 0);
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                if (resource === "post") {
                    if (operation === "create") {
                        const boardID = this.getNodeParameter("boardID", i);
                        const title = this.getNodeParameter("title", i);
                        const details = this.getNodeParameter("details", i, "");
                        const authorID = this.getNodeParameter("authorID", i);
                        responseData = await GenericFunctions_1.cannyApiRequest.call(this, "POST", "/posts/create", {
                            boardID,
                            title,
                            details,
                            authorID,
                        });
                    }
                    else if (operation === "get") {
                        const postID = this.getNodeParameter("postID", i);
                        responseData = await GenericFunctions_1.cannyApiRequest.call(this, "POST", "/posts/retrieve", {
                            id: postID,
                        });
                    }
                    else if (operation === "getAll") {
                        const boardID = this.getNodeParameter("boardID", i, "");
                        const body = boardID ? { boardID } : {};
                        responseData = await GenericFunctions_1.cannyApiRequestAllItemsSkip.call(this, "posts", "/posts/list", body);
                    }
                }
                if (Array.isArray(responseData)) {
                    returnData.push(...responseData.map((item) => ({ json: item })));
                }
                else {
                    returnData.push({ json: responseData });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.Canny = Canny;
//# sourceMappingURL=Canny.node.js.map