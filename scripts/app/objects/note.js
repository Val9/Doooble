'use strict';

var Note = Class.extend({
  init: function (Id, Content, Order) {
    this.Id = Id;
    this.Content = Content;
    this.Order = Order;
  }
});