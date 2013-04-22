'use strict';

angular.module('Doooble.services', ['ngResource'])

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

                var resourceUrl = 'your api uri';
                var key = 'your api key';

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

                var resourceUrl = 'https://sendgrid.com/api/mail.send.json';
                var html = '';
                var subject = '';
                var to = '';
                var from = 'no-reply@your-domain.com';
                var fromname = 'Your name';
                var api_user = 'your user name';
                var api_key = 'your api key';

                var Email = $resource(resourceUrl,
                {
                  api_key: api_key,
                  api_user: api_user,
                  from: from,
                  fromname: fromname
                });

                return Email;

              });