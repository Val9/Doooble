'use strict';

var Task = Item.extend({
  init: function (Id, Name, Complete, Priority, Order, DueDate, DueTime) {
    this._super(Id, Name, Complete, Priority, Order);
    this.DueDate = DueDate;
    this.DueTime = DueTime;
  }
});