'use strict';

var List = Class.extend({
  init: function (Id, Type, Name, Order, Picture, Items, Overdue, DueToday) {
    this.Id = Id;
    this.Type = Type;
    this.Name = Name;
    this.Order = Order;
    this.Picture = Picture;
    this.Items = Items;
    this.Overdue = Overdue;
    this.DueToday = DueToday;
  }
});