/*
* Graph objects are used to store nodes and links, as well as perform operations on them.
*/
class Graph {
    // Requires an options object with the following attributes:
    // nodeSet: a dictionary of nodes, indexed by node id
    // nodes: an array of nodes
    // links: an array of links
    // layout: the layout algorithm to use (only force-directed)
    constructor(options = {}) {
      this.options = options;
      this.nodeSet = {};
      this.nodes = [];
      this.links = [];
      this.layout = undefined;
    }
  
    // if the node is not already in the graph & limit isn't reached, add it
    addNode(node) {
      if (!this.nodeSet[node.id] && !this.reachedLimit()) {
        this.nodeSet[node.id] = node; // add node to nodeSet
        this.nodes.push(node); // add node to nodes
        return true;
      }
      return false;
    }
    // getter for nodeSet
    getNode(nodeId) {
      return this.nodeSet[nodeId];
    }
  
    // if link isn't present, add it
    addLink(source, target) {
      if (source.addConnectedTo(target)) {
        // if it was added, create a new link and add it to the graph
        const edge = new Link(source, target);
        this.links.push(edge);
        return true;
      }
      return false;
    }
    // returns true if the limit has been reached, otherwise false
    reachedLimit() {
      return this.options.limit !== undefined && this.options.limit <= this.nodes.length;
    }
  }
  
/*
* Node objects are used to store information about individual nodes.
*/
class Node {
    constructor(nodeId) {
        this.id = nodeId;
        this.nodesTo = [];
        this.nodesFrom = [];
        this.position = {};
        this.data = {};
    }

    // if the node is not already connected to the given node, add it
    addConnectedTo(node) {
        if (!this.connectedTo(node)) {
        this.nodesTo.push(node);
        return true;
        }
        return false;
    }
    // returns true if the node is already connected to the given node, otherwise false
    connectedTo(node) {
        return this.nodesTo.some(connectedNode => connectedNode.id === node.id);
    }
    }
/*
* Link objects are used to store information about individual links between nodes
*/
class Link {
    constructor(source, target) {
        this.source = source;
        this.target = target;
        this.data = {};
    }
}
