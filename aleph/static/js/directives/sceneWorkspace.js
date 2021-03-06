
aleph.directive('sceneWorkspace', ['$http', '$rootScope', '$location',
    function($http, $rootScope, $location) {

  var Node = function(scene, node) {
    // A node represents one object (person, company, phone, email, ...)
    // on the graph. This object is just interested in layout and grid
    // positioning, not the actual management of the scene canvas.
    var self = this;
    self.scene = scene;
    self.data = node;
    self.name = node.name;
    self.gridX = node.gridX || null;
    self.gridY = node.gridY || null;
    self.id = node.id;

    self.toJSON = function() {
      return {
        id: self.id,
        gridX: self.gridX,
        gridY: self.grifY
      };
    };
  };

  var Edge = function(scene, edge, source, target) {
    // An edge represents a connection between two nodes. It is
    // directed.
    var self = this;
    self.scene = scene;
    self.data = edge;
    self.source = source;
    self.target = target;
    self.id = edge.id;

    self.toJSON = function() {
      return {id: self.id};
    };
  };

  return {
    restrict: 'E',
    scope: {
      scene: '='
    },
    templateUrl: 'templates/scene_workspace.html',
    controller: ['$scope', function($scope) {
      var self = this;
      self.collection_id = null;
      self.nodes = [];
      self.edges = [];

      self.addNode = function(data) {
        for (var i in self.nodes) {
          var node = self.nodes[i];
          if (data.id == node.id) {
            return node;
          }
        }
        var node = new Node(self, data);
        self.completeNode(node);
        self.nodes.push(node);
        self.update();
        return node;
      };

      self.addEdge = function(data) {
        for (var i in self.edges) {
          var edge = self.edges[i];
          if (data.id == edge.id) {
            return edge;
          }
        }
        var edge = new Edge(self, data,
                            self.addNode(data.$source),
                            self.addNode(data.$target));
        self.edges.push(edge);
        // console.log('edge', data);
        self.update();
        return edge;
      };

      self.getNodeIds = function() {
        return self.nodes.map(function(n) { return n.id; });
      };

      self.getEdgeIds = function() {
        return self.edges.map(function(e) { return e.id; });
      };

      self.completeNode = function(node) {
        var nodeIds = self.getNodeIds();
        if (nodeIds.length < 2) {
          return;
        }
        var params = {
          ignore: self.getEdgeIds(),
          source_id: [node.id],
          target_id: nodeIds,
          directed: false,
          limit: 500
        };
        $http.post('/api/1/graph/edges', params).then(function(res) {
          for (var i in res.data.results) {
            var edge = res.data.results[i];
            self.addEdge(edge);
          }
          self.update();
        });
      };

      self.fromJSON = function(scene) {
        self.collection_id = scene.collection_id;
        for (var i in scene.nodes) {
          var node = scene.nodes[i];
          self.addNode(node); 
        }
      };

      self.update = function() {
        $scope.$broadcast('updateScene', self);
      };

      self.toJSON = function() {
        return {
          collection_id: self.collection_id,
          nodes: self.nodes.map(function(n) {
            return n.toJSON();
          }),
          edges: self.edges.map(function(e) {
            return e.toJSON();
          })
        };
      };

      self.fromJSON($scope.scene);
    }]
  };
}]);
