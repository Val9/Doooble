'use strict';

var Product = Item.extend({
  init: function (Id, Name, Complete, Priority, Order, Price, Quantity) {
    this._super(Id, Name, Complete, Priority, Order);
    this.Price = Price;
    this.Quantity = Quantity;
  }
});