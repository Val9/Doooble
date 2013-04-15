'use strict';

angular.module('Doooble.filters', [])

              .filter('truncate', function () {
                return function (text, length, end) {

                  if (isNaN(length))
                    length = 37;

                  if (end === undefined)
                    end = " . . .";

                  if (text.length <= length || text.length - end.length <= length) {
                    return text;
                  } else {
                    return String(text).substring(0, length - end.length) + end;
                  }

                };

              })
              .filter('monetize', function () {
                return function (text, length, end) {
                  text = parseFloat(text);
                  return parseFloat((text).toFixed(2));

                };

              })
              .filter('priority', function () {
                return function (items) {
                  var highPriorityItems = [];

                  for (var i = 0; i < items.length; i++) {
                    if (items[i].Priority == 1 && !items[i].Complete) {
                      highPriorityItems.push(items[i]);
                    }
                  }
                  return highPriorityItems;
                };
              })
              .filter('markdown', function () {
                return function (text) {
                  return marked(text);
                }
              });