'use strict';

var Wish = Item.extend({
  init: function (Id, Name, Complete, Priority, Order, Price) {
    this._super(Id, Name, Complete, Priority, Order);
    this.Price = Price;
  }
});