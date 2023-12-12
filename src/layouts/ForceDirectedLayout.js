import Vector3 from './Vector3';

class ForceDirectedLayout {
    constructor(graph, options) {
      options = options || {};
  
      this.layout = options.layout || "2d";
      this.attractionMultiplier = options.attraction || 5;
      this.repulsionMultiplier = options.repulsion || 0.75;
      this.maxIterations = options.iterations || 1000;
      this.graph = graph;
      this.width = options.width || 200;
      this.height = options.height || 200;
      this.finished = false;
  
      this.callbackPositionUpdated = options.positionUpdated;
  
      this.EPSILON = 0.000001;
      this.attractionConstant = 0;
      this.repulsionConstant = 0;
      this.forceConstant = 0;
      this.layoutIterations = 0;
      this.temperature = 0;
  
      // Performance test
      this.meanTime = 0;
  
      this.init();
    }
  
    init() {
      this.finished = false;
      this.temperature = this.width / 10.0;
      const nodesLength = this.graph.nodes.length;
      this.forceConstant = Math.sqrt(this.height * this.width / nodesLength);
      this.attractionConstant = this.attractionMultiplier * this.forceConstant;
      this.repulsionConstant = this.repulsionMultiplier * this.forceConstant;
    }
  
    generate() {
      if (this.layoutIterations < this.maxIterations && this.temperature > 0.000001) {
        const start = new Date().getTime();
        const { graph } = this;
  
        for (let i = 0; i < graph.nodes.length; i++) {
          const nodeV = graph.nodes[i];
          nodeV.layout = nodeV.layout || {};
  
          if (i === 0) {
            nodeV.layout.offset = new Vector3();
          }
  
          nodeV.layout.force = 0;
          nodeV.layout.tmpPos = nodeV.layout.tmpPos || new Vector3().setVector(nodeV.position);
  
          for (let j = i + 1; j < graph.nodes.length; j++) {
            const nodeU = graph.nodes[j];
            if (i !== j) {
              nodeU.layout = nodeU.layout || {};
              nodeU.layout.tmpPos = nodeU.layout.tmpPos || new Vector3().setVector(nodeU.position);
  
              const delta = nodeV.layout.tmpPos.clone().sub(nodeU.layout.tmpPos);
              const deltaLength = Math.max(this.EPSILON, Math.sqrt(delta.clone().multiply(delta).sum()));
  
              const force = (this.repulsionConstant * this.repulsionConstant) / deltaLength;
  
              nodeV.layout.force += force;
              nodeU.layout.force += force;
  
              if (i === 0) {
                nodeU.layout.offset = new Vector3();
              }
  
              const change = delta.clone().multiply(new Vector3().setScalar(force / deltaLength));
              nodeV.layout.offset.add(change);
              nodeU.layout.offset.sub(change);
            }
          }
        }
  
        for (let i = 0; i < graph.edges.length; i++) {
          const edge = graph.edges[i];
          const delta = edge.source.layout.tmpPos.clone().sub(edge.target.layout.tmpPos);
          const deltaLength = Math.max(this.EPSILON, Math.sqrt(delta.clone().multiply(delta).sum()));
  
          const force = (deltaLength * deltaLength) / this.attractionConstant;
  
          edge.source.layout.force -= force;
          edge.target.layout.force += force;
  
          const change = delta.clone().multiply(new Vector3().setScalar(force / deltaLength));
          edge.target.layout.offset.add(change);
          edge.source.layout.offset.sub(change);
        }
  
        for (let i = 0; i < graph.nodes.length; i++) {
          const node = graph.nodes[i];
          const deltaLength = Math.max(this.EPSILON, Math.sqrt(node.layout.offset.clone().multiply(node.layout.offset).sum()));
          node.layout.tmpPos.add(node.layout.offset.clone().multiply(new Vector3().setScalar(Math.min(deltaLength, this.temperature) / deltaLength)));
  
          const updated = true;
          const tmpPosition = new Vector3(node.position.x, node.position.y, node.position.z);
          tmpPosition.sub(node.layout.tmpPos).divide(new Vector3().setScalar(10));
  
          node.position.x -= tmpPosition.x;
          node.position.y -= tmpPosition.y;
  
          if (this.layout === '3d') {
            node.position.z -= tmpPosition.z;
          }
  
          if (updated && typeof this.callbackPositionUpdated === 'function') {
            this.callbackPositionUpdated(node);
          }
        }
  
        this.temperature *= (1 - (this.layoutIterations / this.maxIterations));
        this.layoutIterations++;
  
        const end = new Date().getTime();
        this.meanTime += end - start;
      } else {
        if (!this.finished) {
          console.log("Average time: " + (this.meanTime / this.layoutIterations) + " ms");
        }
        this.finished = true;
        return false;
      }
      return true;
    }
  
    stopCalculating() {
      this.layoutIterations = this.maxIterations;
    }
  }
  
  // Usage
  // const layout = new ForceDirectedLayout(graph, { width: 2000, height: 2000, iterations: 1000, layout: "3d" });
  // layout.init();
  // layout.generate();
  