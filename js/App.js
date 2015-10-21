// Data models for customers accounts, and transaction tables
function CustomerModel() {
	this.CustomerId = ko.observable();
	this.CreatedDate = ko.observable();
	this.FirstName = ko.observable();
	this.LastName = ko.observable();
	this.Address1 = ko.observable();
	this.Address2 = ko.observable();
	this.City = ko.observable();
	this.State = ko.observable();
	this.Zip = ko.observable();
}

function AccountModel() {
	this.AccountId = ko.observable();
	this.CustomerId = ko.observable();
	this.CreatedDate = ko.observable();
	this.AccountNumber = ko.observable();
	this.Balance = ko.observable();
}

function TransactionModel() {
	this.TransactionId = ko.observable();
	this.AccountId = ko.observable();
	this.TransactionDate = ko.observable();
	this.Amount = ko.observable();
}

// View model
function AppViewModel() {
  var self = this;

  // Specify which page to display:
  //  customer.All: Table of all customers
  //  customer.Add: Add/edit customer
  //  customer.Edit: Add/edit customer
  self.displayedPage = ko.observable('customer.All');

  // Display all customers: displayedPage == 'customer.grid'
  self.customersTable = ko.observableArray(); // Customers loaded from database

  // Add customer
  self.addCustomer = function() {


};

ko.applyBindings(new AppViewModel());
