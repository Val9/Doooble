'use strict';

angular.module('Doooble.services', ['ngResource'])

              .config(function ($httpProvider) {
                $httpProvider.responseInterceptors.push('AjaxInterceptor');
                var spinnerFunction = function (data, headersGetter) {
                  // Ajax call started
                  return data;
                };
                $httpProvider.defaults.transformRequest.push(spinnerFunction);
              })

              // Register the interceptor as a service, intercepts ALL angular ajax http calls
              .factory('AjaxInterceptor', function ($q, $window, $rootScope) {
                return function (promise) {
                  $rootScope.Syncing = true;
                  $("#account-settings :input").attr("disabled", "disabled");
                  return promise.then(function (response) {
                    // Success
                    $rootScope.Syncing = false;
                    $("#account-settings :input").removeAttr("disabled");
                    return response;
                  }, function (response) {
                    // Error
                    $rootScope.Syncing = false;
                    $("#account-settings :input").removeAttr("disabled");
                    return $q.reject(response);
                  }
                )
                };
              })
              .factory('Utils', function () {
                return {

                  newGuid: function () {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); });
                  },

                  newPin: function () {
                    return (Math.floor(Math.random() * 1679615) + 46656).toString(36);
                  }

                }
              }).
              factory('User', function ($resource) {

                var resourceUrl = 'your url here';
                var key = 'your api key here';

                var User = $resource(resourceUrl,
                  { apiKey: key }, {
                    update: { method: 'PUT' }
                  });

                User.prototype.update = function (cb) {
                  return User.update({ id: this._id.$oid }, angular.extend({}, this, { _id: undefined }), cb);
                };

                User.prototype.destroy = function (cb) {
                  return User.remove({ id: this._id.$oid }, cb);
                };

                return User;

              }).
              factory('Local', function () {

                return {

                  get: function () {
                    return JSON.parse(localStorage.getItem('User') || null);
                  },

                  save: function (user) {
                    localStorage.setItem('User', JSON.stringify(user));
                  },

                  clear: function () {
                    localStorage.clear();
                  }

                }
              }).
              factory('Email', function ($resource) {

                var resourceUrl = 'your url here';
                var html = '';
                var subject = '';
                var to = '';
                var from = 'no-reply@yourdomain.com';
                var fromname = 'Your name';
                var api_user = 'your api user name here';
                var api_key = 'your api key here';

                var Email = $resource(resourceUrl,
                {
                  api_key: api_key,
                  api_user: api_user,
                  from: from,
                  fromname: fromname
                });

                return Email;

              });