
aleph.factory('Authz', ['$rootScope', function($rootScope) {

  var collection = function(right, collection_id) {
    if ($rootScope.session.permissions && $rootScope.session.permissions[right]) {
      return $rootScope.session.permissions[right].indexOf(collection_id) != -1;
    }
    return false;
  };

  return {
    collection: collection,
    entityWrite: function(entity) {
      for (var i in entity.collection_id) {
        var coll_id = entity.collection_id[i];
        if (collection('write', coll_id)) {
          return true;
        }
      }
      return false;
    },
    documentWrite: function(doc) {
      return collection('write', doc.source_collection_id);
    },
    logged_in: function() {
      return $rootScope.session && $rootScope.session.logged_in;
    },
    is_admin: function() {
      return $rootScope.session && $rootScope.session.logged_in && $rootScope.session.role.is_admin;
    },
    READ: 'read',
    WRITE: 'write'
  }
}]);
