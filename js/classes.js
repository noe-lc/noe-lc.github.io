/**
 * BASED ON https://github.com/mburst/dijkstras-algorithm/blob/master/dijkstras.js
 */

const INFINITY = 1/0;

class PriorityQueue {
  nodes = [];

  enqueue(priority, key) {
    this.nodes.push({key: key, priority: priority });
    this.sort();
  };

  dequeue() {
    return this.nodes.shift().key;
  };

  sort() {
    this.nodes.sort((a, b) => a.priority - b.priority);
  };

  isEmpty() {
    return !this.nodes.length;
  };
};

class Graph {
  vertices = {};

  addVertex(name, edges) {
    this.vertices[name] = edges;
  };

  getShortestPath(start, finish) {
    var smallest, vertex, neighbor, alt;
    var nodes = new PriorityQueue(),
      distances = {},
      previous = {},
      path = [];
    
    for(vertex in this.vertices) {
      if(vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(0, vertex);
      }
      else {
        distances[vertex] = INFINITY;
        nodes.enqueue(INFINITY, vertex);
      }

      previous[vertex] = null;
    }

    while(!nodes.isEmpty()) {
      smallest = nodes.dequeue();

      if(smallest === finish) {
        path = [];

        while(previous[smallest]) {
          path.push(smallest);
          smallest = previous[smallest];
        }

        break;
      }

      if(!smallest || distances[smallest] === INFINITY){
        continue;
      }

      for(neighbor in this.vertices[smallest]) {
        alt = distances[smallest] + this.vertices[smallest][neighbor];

        if(alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = smallest;

          nodes.enqueue(alt, neighbor);
        }
      }
    }
    return path;
  }
};

function run() {
  const g = new Graph(),
    start = document.getElementById('start').value,
    finish = document.getElementById('finish').value,
    resultSpan = document.getElementById('result');
  try {
    const json = JSON.parse(document.getElementById('json').value);
    for (let [key,value] of Object.entries(json)) {
      g.addVertex(key,value);
    }
    const result = [...g.getShortestPath(start,finish),'A'].reverse();
    resultSpan.className = 'ok';
    resultSpan.innerText =  `Shortest path is: ${result.join('-')}`;
  } catch(err) {
    resultSpan.className = 'err';
    resultSpan.innerText = 'Error: check console for details';
    console.error('err :', err);
  }
}