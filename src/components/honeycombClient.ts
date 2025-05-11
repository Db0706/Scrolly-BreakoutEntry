// honeycombClient.ts
import createEdgeClient from "@honeycomb-protocol/edge-client";

const edgeClient = createEdgeClient("https://edge.test.honeycombprotocol.com", true);

export default edgeClient;
