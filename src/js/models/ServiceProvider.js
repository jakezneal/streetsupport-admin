var ajax = require('basic-ajax')
var Endpoints = require('../endpoint-builder')
var adminUrls = require('../admin-urls')
var cookies = require('../cookies')
var browser = require('../browser')
var getUrlParameter = require('../get-url-parameter')
var Address = require('./Address')
var Service = require('./Service')
var ko = require('knockout')

function ServiceProvider (data) {
  var self = this

  self.key = ko.observable(data.key)
  self.name = ko.observable(data.name)
  self.description = ko.observable(data.description)
  self.telephone = ko.observable(data.telephone)
  self.email = ko.observable(data.email)
  self.website = ko.observable(data.website)
  self.facebook = ko.observable(data.facebook)
  self.twitter = ko.observable(data.twitter)
  data.addresses.forEach(a => {
    a.serviceProviderId = data.key
  })
  self.addresses = ko.observableArray(data.addresses.map(a => new Address(a)))
  self.addresses().forEach(a => {
    a.addListener(this)
  })
  data.providedServices.forEach(s => {
    s.serviceProviderId = data.key
  })

  self.newServices = ko.observable(data.providedServices.map(s => new Service(s)))

  self.addAddressUrl = adminUrls.serviceProviderAddressesAdd + '?providerId=' + data.key
  self.amendAddressesUrl = adminUrls.serviceProviderAddresses + '?key=' + data.key

  self.addServiceUrl = adminUrls.serviceProviderServicesAdd + '?providerId=' + data.key
  self.amendServicesUrl = adminUrls.serviceProviderServices + '?providerId=' + data.key

  self.deleteAddress = function(deletedAddress) {
    var remainingAddresses = self.addresses().filter(address => {
      return address.key() !== deletedAddress.key()
    })
    self.addresses(remainingAddresses)
  }
}

function ServiceProviderDetails () {
  var self = this
  self.initialServiceProvider = ko.observable()
  self.serviceProvider = ko.observable()
  self.isEditingGeneralDetails = ko.observable(false)
  self.isEditingContactDetails = ko.observable(false)
  self.message = ko.observable('')
  self.endpoints = new Endpoints()

  self.init = function () {
    var providerId = getUrlParameter.parameter('key')
    ajax.get(self.endpoints.serviceProviders(providerId).build(),
      {
        'content-type': 'application/json',
        'session-token': cookies.get('session-token')
      },
      {})
      .then(function (result) {
        self.serviceProvider(new ServiceProvider(result.json))
        self.initialServiceProvider(new ServiceProvider(result.json))
      },
      function (error) {
        browser.redirect(adminUrls.notFound)
      })
  }

  self.editGeneralDetails = function () {
    self.isEditingGeneralDetails(true)
  }

  self.cancelEditGeneralDetails = function () {
    self.isEditingGeneralDetails(false)
    self.restoreViewModel()
  }

  self.saveGeneralDetails = function () {
    if (self.isEditingGeneralDetails()) {
      ajax.put(self.endpoints.serviceProviders(getUrlParameter.parameter('key')).generalInformation().build(),
        {
          'content-type': 'application/json',
          'session-token': cookies.get('session-token')
        },
        JSON.stringify({
          'Description': self.serviceProvider().description()
        })
        ).then(function (result) {
          self.isEditingGeneralDetails(false)
        }, function (error) {
          var response = JSON.parse(error.response)
          self.message(response.messages.join('<br />'))
        })
    }
  }

  self.editContactDetails = function () {
    self.isEditingContactDetails(true)
  }

  self.cancelEditContactDetails = function () {
    self.isEditingContactDetails(false)
    self.restoreViewModel()
  }

  self.saveContactDetails = function () {
    if (self.isEditingContactDetails()) {
      ajax.put(self.endpoints.serviceProviders(getUrlParameter.parameter('key')).contactDetails().build(),
        {
          'content-type': 'application/json',
          'session-token': cookies.get('session-token')
        },
        JSON.stringify({
          'Telephone': self.serviceProvider().telephone(),
          'Email': self.serviceProvider().email(),
          'Website': self.serviceProvider().website(),
          'Facebook': self.serviceProvider().facebook(),
          'Twitter': self.serviceProvider().twitter()
        })
        ).then(function (result) {
          self.isEditingContactDetails(false)
        }, function (error) {
          var response = JSON.parse(error.response)
          self.message(response.messages.join('<br />'))
        })
    }
  }

  self.restoreViewModel = function () {
    self.serviceProvider().description(self.initialServiceProvider().description())

    self.serviceProvider().telephone(self.initialServiceProvider().telephone())
    self.serviceProvider().email(self.initialServiceProvider().email())
    self.serviceProvider().website(self.initialServiceProvider().website())
    self.serviceProvider().facebook(self.initialServiceProvider().facebook())
    self.serviceProvider().twitter(self.initialServiceProvider().twitter())
  }

  self.init()
}

module.exports = ServiceProviderDetails
