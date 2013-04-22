'use strict';

var doooble = angular.module('Doooble', ['Doooble.filters', 'Doooble.services', 'Doooble.directives', 'ngSanitize']).
  config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider.when('/', { templateUrl: 'pages/lists.html', controller: ListController });

    $routeProvider.when('/tasks/:listId', { templateUrl: 'pages/tasks.html', controller: TaskController });
    $routeProvider.when('/wishes/:listId', { templateUrl: 'pages/wishes.html', controller: TaskController });
    $routeProvider.when('/products/:listId', { templateUrl: 'pages/products.html', controller: TaskController });
    $routeProvider.when('/notes/:listId', { templateUrl: 'pages/notes.html', controller: NoteController });

	$routeProvider.when('/search', { templateUrl: 'pages/search.html', controller: SearchController });

    $routeProvider.otherwise({ redirectTo: '/' });

  }]);