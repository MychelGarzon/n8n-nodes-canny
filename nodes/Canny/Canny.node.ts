import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";

import {
  cannyApiRequest,
  cannyApiRequestAllItemsSkip,
} from "./GenericFunctions";
import { boardOperations, boardFields } from "./descriptions/BoardDescription";
import {
  categoryOperations,
  categoryFields,
} from "./descriptions/CategoryDescription";
import { postOperations, postFields } from "./descriptions/PostDescription";
import { ideaOperations, ideaFields } from "./descriptions/IdeaDescription";
import {
  portalCommentOperations,
  portalCommentFields,
} from "./descriptions/PortalCommentDescription";

export class Canny implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Canny",
    name: "canny",
    icon: "file:canny.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      "Consume the Canny API (product feedback, feature requests, roadmap)",
    defaults: { name: "Canny" },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
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
      ...boardOperations,
      ...boardFields,
      ...categoryOperations,
      ...categoryFields,
      ...postOperations,
      ...postFields,
      ...ideaOperations,
      ...ideaFields,
      ...portalCommentOperations,
      ...portalCommentFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter("resource", 0) as string;
    const operation = this.getNodeParameter("operation", 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        // Route to the right endpoint per resource + operation.
        // This switch is intentionally flat rather than split into
        // per-resource executor files — with five resources at v1
        // scope, one switch stays easier to scan than five imports.
        // Revisit this if v2 resources push the file past ~300 lines.
        if (resource === "post") {
          if (operation === "create") {
            const boardID = this.getNodeParameter("boardID", i) as string;
            const title = this.getNodeParameter("title", i) as string;
            const details = this.getNodeParameter("details", i, "") as string;
            const authorID = this.getNodeParameter("authorID", i) as string;

            responseData = await cannyApiRequest.call(
              this,
              "POST",
              "/posts/create",
              {
                boardID,
                title,
                details,
                authorID,
              },
            );
          } else if (operation === "get") {
            const postID = this.getNodeParameter("postID", i) as string;
            responseData = await cannyApiRequest.call(
              this,
              "POST",
              "/posts/retrieve",
              {
                id: postID,
              },
            );
          } else if (operation === "getAll") {
            const boardID = this.getNodeParameter("boardID", i, "") as string;
            const body = boardID ? { boardID } : {};
            responseData = await cannyApiRequestAllItemsSkip.call(
              this,
              "posts",
              "/posts/list",
              body,
            );
          }
          // TODO: 'update' / 'delete' / 'changeStatus' operations —
          // wire up once Status Changes docs are read and it's
          // confirmed whether status lives on /posts or a separate
          // endpoint.
        }

        // TODO: board / category / idea / portalComment routing.
        // Left out of this boilerplate deliberately — wire these up
        // following the same pattern as 'post' above once each
        // resource's field set is finalized in its description file.

        if (Array.isArray(responseData)) {
          returnData.push(
            ...responseData.map((item) => ({ json: item as any })),
          );
        } else {
          returnData.push({ json: responseData });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
