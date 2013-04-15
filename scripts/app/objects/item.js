'use strict';

var Item = Class.extend({
  init: function (Id, Name, Complete, Priority, Order) {
    this.Id = Id;
    this.Name = Name;
    this.Complete = Complete;
    this.Priority = Priority;
    this.Order = Order;
  }
});