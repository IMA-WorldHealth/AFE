var app = angular.module('AFE', ['ngRoute', 'ngResource', 'ui.bootstrap', 'angularFileUpload']);

// Intercept server sent errors, potentially rejecting auth errors
function AuthInjector($rootScope, $q, $location, Session) {
  return {

    // called on server error
    responseError : function (response) {

      // if the server sends back a 403 "Not Authorized",
      // and the code is ERR_NO_SESSION, we have had a session timeout
      // on the server.  Redirect to login
      if (response.status === 403 && response.data.code === "ERR_NO_SESSION") {
        console.log('[AUTH] No session found!');
        Session.destroy();
        $location.url('/login');
      }

      return $q.reject(response);
    }
  };
}

// ensure that the user is properly connected
app.factory('AuthenticationInjectorFactory', ['$rootScope', '$q', '$location', 'Session', AuthInjector]);

// configure routes
function configRoutes($routeProvider) {
  $routeProvider
  .when('/', {
    controller : 'MainController as MainCtrl',
    templateUrl : 'modules/main/main.html'
  })
  .when('/login', {
    controller : 'LoginController as LoginCtrl',
    templateUrl : 'modules/login/login.html'
  })
  .when('/dashboard', {
    controller : 'DashboardController as DashboardCtrl',
    templateUrl : 'modules/dashboard/dashboard.html'
  })
  .when('/requests/create', {
    controller : 'RequestController as RequestCtrl',
    templateUrl : 'modules/requests/create.html'
  })
  .when('/requests/:id', {
    controller : 'RequestReviewController as ReviewCtrl',
    templateUrl : 'modules/requests/review.html'
  })
  .when('/users/:userid', {
    controller : 'UserController as UserCtrl',
    templateUrl : 'modules/users/users.html'
  })
  .when('/users/:id/profile', {
    controller : 'UserProfileController as ProfileCtrl',
    templateUrl : 'modules/users/profile.html'
  })
  .when('/users/account/recovery', {
    controller : 'RecoveryController as RecoveryCtrl',
    templateUrl: 'modules/users/recovery/recovery.html'
  })
  .when('/projects', {
    controller : 'ProjectController as ProjectCtrl',
    templateUrl : 'modules/projects/project.html'
  })
  .otherwise('/login');
}

function configAuth($httpProvider) {
  $httpProvider.interceptors.push(['$injector', function ($injector) {
    return $injector.get('AuthenticationInjectorFactory');
  }
]);

}

function run($rootScope, $location, Session) {

  function contains(array, value) { return array.indexOf(value) !== -1; }

  // make sure that the user is authenticated
  $rootScope.$on('$routeChangeStart', function (event, next) {
    var publicRoutes = ['/users/account/recovery', '/users/account/reset', '/login'],
        route = next.originalPath;

    // NOTE - cannot have a user with id === 0
    if (!Session.id && !contains(publicRoutes, route)) {
      console.log('Redirecting to public /login', route);
      $location.url('/login');
    }

    if (!!Session.id && route === '/login') {
      console.log('Blocking attempt at accessing login page.');
      $location.url('/');
    }
  });
}

// configure and run
app.config(['$httpProvider', configAuth]);
app.config(['$routeProvider', configRoutes]);
app.run(['$rootScope', '$location', 'Session', run]);
