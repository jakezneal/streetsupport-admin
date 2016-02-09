var FastClick = require('fastclick')
var nav = require('./../nav.js')

nav.init()
FastClick.attach(document.body)

require.ensure(['knockout', '../models/ResetPassword'], function (require) {
  var ko = require('knockout')
  var Model = require('../models/ResetPassword')
  ko.applyBindings(new Model())
})
