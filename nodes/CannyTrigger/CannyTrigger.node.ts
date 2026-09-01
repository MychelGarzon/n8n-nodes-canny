import {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  NodeConnectionTypes,
} from "n8n-workflow";


export class CannyTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Canny Trigger",
    name: "cannyTrigger",
    icon: { light: "file:canny.svg", dark: "file:canny.dark.svg" },
    group: ["trigger"],
    version: 1,
    subtitle: "={{$parameter[\"event\"]}}",
    description:
      "Starts the workflow when a Canny event occurs (e.g. new post, status change)",
    defaults: { name: "Canny Trigger" },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
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
        options: [
          // TODO: populate once the Webhooks docs confirm actual
          // event names Canny sends (e.g. post.created,
          // post.status_changed, comment.created).
        ],
        default: "",
      },
    ],
  };

  webhookMethods = {
    default: {
      checkExists: async function (this: IHookFunctions): Promise<boolean> {
        // TODO: call the relevant Canny "list webhooks" endpoint
        // and check if one matching this workflow's URL exists.
        return false;
      },
      create: async function (this: IHookFunctions): Promise<boolean> {
        // TODO: register the webhook via Canny's API, if that's how
        // registration works (see class-level TODO #2 above).
        return true;
      },
      delete: async function (this: IHookFunctions): Promise<boolean> {
        // TODO: deregister the webhook on workflow deactivation.
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData();

    // TODO: verify signature header here before trusting bodyData,
    // once confirmed whether Canny signs payloads.

    return {
      workflowData: [this.helpers.returnJsonArray(bodyData)],
    };
  }
}