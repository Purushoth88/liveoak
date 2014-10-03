'use strict';

var loMod = angular.module('loApp.services', []).value('version', '0.1');

/*
  FileReader service, taken from:
  http://odetocode.com/blogs/scott/archive/2013/07/03/building-a-filereader-service-for-angularjs-the-service.aspx
 */
loMod.factory('FileReader', function($q) {
  var onLoad = function(reader, deferred, scope) {
    return function () {
      scope.$apply(function () {
        deferred.resolve(reader.result);
      });
    };
  };

  var onError = function (reader, deferred, scope) {
    return function () {
      scope.$apply(function () {
        deferred.reject(reader.result);
      });
    };
  };

  var onProgress = function(reader, scope) {
    return function (event) {
      scope.$broadcast('fileProgress',
        {
          total: event.total,
          loaded: event.loaded
        });
    };
  };

  var getReader = function(deferred, scope) {
    var reader = new FileReader();
    reader.onload = onLoad(reader, deferred, scope);
    reader.onerror = onError(reader, deferred, scope);
    reader.onprogress = onProgress(reader, scope);
    return reader;
  };

  var readAsDataURL = function (file, scope) {
    var deferred = $q.defer();

    var reader = getReader(deferred, scope);
    reader.readAsText(file);

    return deferred.promise;
  };

  return {
    readAsDataUrl: readAsDataURL
  };
});

loMod.factory('LoStorage', function($resource) {
  return $resource('/admin/applications/:appId/resources/:storageId', {
    appId : '@appId',
    storageId : '@storageId'
  }, {
    get : {
      method : 'GET'
    },
    getList : {
      method : 'GET',
      params: { fields : '*(*)' }
    },
    create : {
      method : 'POST',
      params : { appId : '@appId'}
    },
    update : {
      method : 'PUT',
      params : { appId : '@appId', storageId : '@storageId'}
    },
    delete : {
      method : 'DELETE',
      params : { appId : '@appId', storageId : '@storageId'}
    }
  });
});

loMod.factory('LoCollection', function($resource) {
  return $resource('/:appId/:storageId/:collectionId?fields=*(*)', {
    appId : '@appId',
    storageId : '@storageId',
    collectionId : '@collectionId'
  }, {
    get : {
      method : 'GET',
      params: { appId : '@appId', storageId : '@storageId', collectionId: '@collectionId'}
    },
    getList : {
      method : 'GET'
    },
    create : {
      method : 'POST',
      params : { appId : '@appId', storageId : '@storageId'}
    },
    update : {
      method : 'PUT',
      params : { appId : '@appId', storageId : '@storageId', collectionId: '@collectionId'}
    },
    delete : {
      method : 'DELETE',
      params : { appId : '@appId', storageId : '@storageId', collectionId: '@collectionId'}
    }
  });
});

loMod.factory('LoCollectionItem', function($resource) {
  return $resource('/:appId/:storageId/:collectionId/:itemId', {
    appId : '@appId',
    storageId : '@storageId',
    collectionId : '@collectionId'
  }, {
    get : {
      method : 'GET',
      params: { appId : '@appId', storageId : '@storageId', collectionId: '@collectionId', itemId: '@itemId' }
    },
    getList : {
      method : 'GET',
      params: { appId : '@appId', storageId : '@storageId', collectionId: '@collectionId', fields : '*(*)' }
    },
    create : {
      method : 'POST',
      params : { appId : '@appId', storageId : '@storageId', collectionId: '@collectionId'}
    },
    update : {
      method : 'PUT',
      params : { appId : '@appId', storageId : '@storageId', collectionId: '@collectionId', itemId: '@itemId'}
    },
    delete : {
      method : 'DELETE',
      params : { appId : '@appId', storageId : '@storageId', collectionId: '@collectionId', itemId: '@itemid'}
    }
  });
});

loMod.factory('LoApp', function($resource) {
  return $resource('/admin/applications/:appId', {
    appId : '@appId'
  }, {
    get : {
      method : 'GET'
    },
    getList : {
      method : 'GET',
      params: { fields : '*(*)' }
    },
    create : {
      method : 'POST',
      url: '/admin/applications/'
    },
    save : {
      method : 'PUT',
      url: '/admin/applications/:appId'
    },
    addResource : {
      method : 'PUT',
      url: '/admin/applications/:appId/resources/:resourceId'
    }
  });
});

loMod.factory('LoStorageLoader', function(LoStorage, $route) {
  return function() {
    return LoStorage.get({
      appId : $route.current.params.appId,
      storageId: $route.current.params.storageId
    }).$promise;
  };
});

loMod.factory('LoStorageListLoader', function(LoStorage, $route) {
  return function() {
    return LoStorage.getList({
      appId : $route.current.params.appId
    }).$promise;
  };
});

loMod.factory('LoCollectionListLoader', function(LoCollection, $route) {
  return function() {
    return LoCollection.get({
      appId: $route.current.params.appId,
      storageId: $route.current.params.storageId
    }).$promise;
  };
});

loMod.factory('LoPushLoader', function(LoPush, $route, $log) {
  return function() {
    return LoPush.get({
        appId : $route.current.params.appId
      },
      function(httpResponse) {
        $log.error(httpResponse);
        return {
          appId : $route.current.params.appId
        };
      }).$promise;
  };
});

loMod.factory('LoAppLoader', function(LoApp, $route) {
  return function() {
    return LoApp.get({
      appId : $route.current.params.appId
    }).$promise;
  };
});

loMod.factory('LoAppListLoader', function(LoApp) {
  return function() {
    return LoApp.getList().$promise;
  };
});

loMod.factory('LoCollectionLoader', function(LoCollection) {
  return function() {
    return LoCollection.get().$promise;
  };
});

loMod.factory('LoPush', function($resource) {
  return $resource('/admin/applications/:appId/resources/push', {
    appId : '@appId'
  }, {
    get : {
      method : 'GET',
      params : { appId : '@appId'}
    },
    update : {
      method : 'PUT',
      params : { appId : '@appId'}
    },
    create: {
      method : 'POST',
      url: '/admin/applications/:appId/resources/',
      params : { appId : '@appId'}
    },
    delete : {
      method : 'DELETE',
      params : { appId : '@appId'}
    }
  });
});

loMod.factory('LoRealmApp', function($resource, LiveOak) {
  return $resource(LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/applications/:appId', {
    realmId : 'liveoak-apps',
    appId: '@appId'
  }, {
    save: {
      method: 'PUT'
    },
    create: {
      method: 'POST'
    },
    delete: {
      method: 'DELETE'
    }
  });
});

loMod.factory('LoRealmAppRoles', function($resource, LiveOak) {
  return $resource(LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/applications/:appId/roles/:roleName', {
    realmId : 'liveoak-apps',
    appId: '@appId',
    roleName: '@roleName'
  });
});

loMod.factory('LoRealmRoles', function($resource, LiveOak) {
  return $resource(LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/roles', {
    realmId : 'liveoak-apps'
  });
});

loMod.factory('LoRealmClientRoles', function($resource, LiveOak) {
  return $resource(LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/applications/:appId/scope-mappings/realm', {
    realmId: 'liveoak-apps',
    appId: '@appId'
  });
});

loMod.factory('LoRealmAppClientScopeMapping', function($resource, LiveOak) {
  return $resource(LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/applications/:clientId/scope-mappings/applications/:appId', {
    realmId: 'liveoak-apps',
    appId : '@appId',
    clientId : '@clientId'
  });
});

loMod.factory('LoRealmAppClientScopeMappingLoader', function(LoRealmAppClientScopeMapping, $route) {
  return function(){
    return LoRealmAppClientScopeMapping.query({
      realmId: 'liveoak-apps',
      appId: $route.current.params.appId,
      clientId: $route.current.params.clientId
    }).$promise;
  };
});

loMod.factory('LoRealmAppLoader', function(LoRealmApp, $route) {
  return function(){
    return LoRealmApp.get({
      realmId: 'liveoak-apps',
      appId : $route.current.params.appId
    }).$promise;
  };
});

loMod.factory('LoRealmRolesLoader', function(LoRealmRoles) {
  return function(){
    return LoRealmRoles.query({
      realmId: 'liveoak-apps'
    }).$promise;
  };
});

loMod.factory('LoRealmAppListLoader', function(LoRealmApp) {
  return function(){
    return LoRealmApp.query({
      realmId: 'liveoak-apps'
    }).$promise;
  };
});

loMod.factory('LoRealmAppRolesLoader', function(LoRealmAppRoles, $route) {
  return function(){
    return LoRealmAppRoles.query({
      realmId: 'liveoak-apps',
      appId : $route.current.params.appId
    }).$promise;
  };
});

loMod.factory('LoRealmClientRolesLoader', function(LoRealmClientRoles, $route) {
  return function(){
    return LoRealmClientRoles.query({
      realmId: 'liveoak-apps',
      appId : $route.current.params.appId
    }).$promise;
  };
});


loMod.factory('LoSecurityCollections', function($resource) {
  return $resource('/:appId', {
    appId : '@appId'
  }, {
    get : {
      method: 'GET',
      params: { fields : '*(*)' }
    }
  });
});

loMod.factory('LoSecurityCollectionsLoader', function(LoSecurityCollections, $route) {
  return function(){
    return LoSecurityCollections.get({
      appId : $route.current.params.appId
    }).$promise;
  };
});

loMod.factory('LoSecurity', function($resource) {
  return $resource('/admin/applications/:appId/resources/uri-policy', {
    appId : '@appId'
  }, {
    create : {
      method: 'PUT'
    },
    save : {
      method: 'PUT'
    }
  });
});

loMod.factory('LoSecurityLoader', function(LoSecurity, $route) {
  return function(){
    return LoSecurity.get( {
      appId : $route.current.params.appId
    }).$promise;
  };
});

loMod.factory('LoACL', function($resource) {
  return $resource('/admin/applications/:appId/resources/acl-policy', {
    appId : '@appId'
  }, {
    create : {
      method: 'PUT'
    },
    save : {
      method: 'PUT'
    }
  });
});

loMod.factory('LoACLLoader', function(LoACL, $route) {
  return function(){
    return LoACL.get({
      appId : $route.current.params.appId
    }).$promise;
  };
});

loMod.factory('LoRealmUsers', function($resource, LiveOak) {
  return $resource(LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/users/:userId', {
    realmId : 'liveoak-apps',
    userId : '@userId'
  }, {
    resetPassword : {
      method: 'PUT',
      url: LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/users/:userId/reset-password'
    },
    addRoles : {
      method: 'POST',
      url: LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/users/:userId/role-mappings/applications/:appId'
    },
    deleteRoles : {
      method: 'DELETE',
      url: LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/users/:userId/role-mappings/applications/:appId'
    },
    getRoles: {
      method: 'GET',
      url: LiveOak.getAuthServerUrl() + '/admin/realms/:realmId/users/:userId/role-mappings/applications/:appId/composite',
      isArray: true
    },
    update: {
      method: 'PUT'
    }
  });
});

loMod.factory('LoRealmUserLoader', function(LoRealmUsers, $route) {
  return function(){
    return LoRealmUsers.get({
      userId : $route.current.params.userId
    }).$promise;
  };
});

loMod.factory('LoAppExamples', function($resource) {
  return $resource('/admin/console/resources/example-applications.json',
    {},
    {
      get: {
        method: 'GET',
        url: '/admin/console/resources/liveoak-examples/:parentId/:exampleId/application.json'
      },
      install: {
        method : 'POST',
        url: '/admin/applications/',
        headers: {
          'Content-Type':'application/vnd.liveoak.local-app+json'
        }
      }
    });
});

loMod.factory('LoClient', function($resource) {
  return $resource('/admin/applications/:appId/resources/application-clients/:clientId', {
    appId : '@appId',
    clientId: '@clientId'
  }, {
    get : {
      method : 'GET'
    },
    getList : {
      method : 'GET',
      params : { fields: '*(*)' }
    },
    update : {
      method : 'PUT'
    },
    create : {
      method : 'POST',
      params : { appId : '@appId' }
    },
    delete : {
      method : 'DELETE'
    }
  });
});

loMod.factory('LoBusinessLogicScripts', function($resource) {
  return $resource('/admin/applications/:appId/resources/scripts/:type/:scriptId', {
    appId : '@appId',
  }, {
    get : {
      method : 'GET',
      params : { fields: '*(*)' }
    },
    create: {
      method: 'POST'
    },
    getResource : {
      method : 'GET',
      url: '/admin/applications/:appId/resources/scripts/'
    },
    createResource : {
      method : 'PUT',
      url: '/admin/applications/:appId/resources/scripts',
      params : { appId : '@appId'}
    },
    getSource : {
      method : 'GET',
      url: '/admin/applications/:appId/resources/scripts/:type/:scriptId/script'
    },
    setSource: {
      method: 'POST',
      headers: {
        'Content-Type':'application/javascript'
      }
    }
  });
});
