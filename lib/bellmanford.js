function Edge(src, dest, weight) {
  this.src = src;
  this.dest = dest;
  this.weight = weight;
}

function Graph(N) {
  this.N = N;
  this.edges = [];
}

Graph.prototype.addEdge = function(edge) {
  this.edges.push(edge);
}

Graph.prototype.findNegativeCycle = function (src) {
  let N = this.N;
  let dist = Array(N).fill(100000000);;
  let parent = Array(N).fill(-1);;
  dist[src] = 1;
  for (let i = 1; i <= N - 1; i++) {
    for (let j = 0; j < this.edges.length; j++) {
      let u = this.edges[j].src;
      let v = this.edges[j].dest;
      let weight = this.edges[j].weight;
      if (dist[u] !== 100000000
        && dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
        parent[v] = u;
      }
    }
  }
  let C = -1;
  for (let i = 0; i < this.edges.length; i++) {
    let u = this.edges[i].src;
    let v = this.edges[i].dest;
    let weight = this.edges[i].weight;
    if (dist[u] !== 100000000
      && dist[u] + weight < dist[v]) {
      C = v;
      break;
    }
  }
  if (C !== -1) {
    for (let i = 0; i < N; i++)
      C = parent[C];
    let cycle = [];
    for (let v = C;; v = parent[v]) {
      cycle.push(v);
      if (v === C && cycle.length > 1)
        break;
    }
    cycle.reverse();
    return cycle;
  }
  else
    return [];
}

module.exports = {
  Edge, Graph
}