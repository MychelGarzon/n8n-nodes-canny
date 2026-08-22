"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannyTrigger = void 0;
class CannyTrigger {
    constructor() {
        this.description = {
            displayName: "Canny Trigger",
            name: "cannyTrigger",
            icon: "file:canny.svg",
            group: ["trigger"],
            version: 1,
            description: "Starts the workflow when a Canny event occurs (e.g. new post, status change)",
            defaults: { name: "Canny Trigger" },
            inputs: [],
            outputs: ["main"],
            credentials: [
                {
                    name: "cannyApi",
                    required: true,
                },
            ],
            webhooks: [
                {
                    name: "default",
                    httpMethod: "POST",
                    responseMode: "onReceived",
                    path: "webhook",
                },
            ],
            properties: [
                {
                    displayName: "Event",
                    name: "event",
                    type: "options",
                    noDataExpression: true,
                    options: [],
                    default: "",
                },
            ],
        };
        this.webhookMethods = {
            default: {
                checkExists: async function () {
                    return false;
                },
                create: async function () {
                    return true;
                },
                delete: async function () {
                    return true;
                },
            },
        };
    }
    async webhook() {
        const bodyData = this.getBodyData();
        return {
            workflowData: [this.helpers.returnJsonArray(bodyData)],
        };
    }
}
exports.CannyTrigger = CannyTrigger;
//# sourceMappingURL=CannyTrigger.node.js.map