// Data models for customers, accounts, and transaction tables
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
  var apiURL = 'http://localhost:49750/api'; // URL for API
  // Strings to add to API URL for the various resources
  var customersURLString = '/customers';
  var accountsURLString = '/accounts';
  var transactionsURLString = '/transactions';

  // Set strings for which page to display:
  //  customer.All: Table of all customers
  //  customer.Add: Add/edit customer
  //  customer.Edit: Add/edit customer
  self.displayPageAllCustomers = ko.observable('customer.All');
  self.displayPageEditCustomer = ko.observable('customer.Add');
  self.displayPageAddCustomer = ko.observable('customer.Edit');

  // Initialize indicator of which page to display to all customers
  self.displayedPage = ko.observable(self.displayPageAllCustomers());

  self.customersTable = ko.observableArray(); // Customers loaded from database

  self.selectedCustomer = new CustomerModel(); // Customer being added or edited
  self.selectedCustomerAccounts = ko.observableArray(); // Accounts belonging to customer

  // Add customer
  self.addCustomer = function() {
		initializeSelectedCustomer();
    self.displayedPage(self.displayPageAddCustomer());
  };

  // Edit customer
  self.editCustomer = function(customer) {

    // Get customer and account data
    $.ajax({
  		type: 'GET',
  		url: apiURL + customersURLString + '/' + customer.CustomerId(),
  		success: function(data) {
  			ko.mapping.fromJS(data, {}, self.selectedCustomer);

        // Get customer's accounts
				getCustomerAccounts(customer);

		    //   set indicator to switch to edit customer page
        self.displayedPage(self.displayPageEditCustomer());

  		}
  	});

  };

  // Save new or edited customer
  self.saveCustomer = function() {
		// Validate the entered customer data
		if (validateCustomer()) {
			// If adding new customer then do POST, otherwise do PUT
	    if (self.displayedPage() == self.displayPageAddCustomer()) {
	      $.ajax({
	        type: 'POST',
	        url: apiURL + customersURLString,
	        contentType: 'application/json;charset=utf-8',
	        data: ko.mapping.toJSON(self.selectedCustomer),
	        success: function(data) {

	          // Push new customer onto customer array
						pushNewCustomer();

						toastr.success('Customer ' + self.selectedCustomer.FirstName() + ' ' +
	                  self.selectedCustomer.LastName() + ' was successfully added');

						//  Initialize selected customer data
	          //  Set indicator to display all customers
						initializeSelectedCustomer();
	          self.displayedPage(self.displayPageAllCustomers());

	        },
					error: function(jqXHR, textStatus, errorThrown) {
						toastr.error(JSON.parse(jqXHR.responseText).ExceptionMessage, 'Error Adding Customer');
		 		 }
	      });

	    } // Updating customer: use PUT
	    else {
	      $.ajax({
	        type: 'PUT',
	        url: apiURL + customersURLString + '/' + self.selectedCustomer.CustomerId(),
	        contentType: 'application/json;charset=utf-8',
	        data: ko.mapping.toJSON(self.selectedCustomer),
	        success: function(data) {

	          toastr.success('Customer ' + self.selectedCustomer.FirstName() + ' ' +
	                  self.selectedCustomer.LastName() + ' was successfully updated');

						// Reload customers
						// Set indicator to display all customers
						self.reload.customers();
	          self.displayedPage(self.displayPageAllCustomers());
	        }
	      });
	    }
		}
  };

	// User canceled when adding/editing customer
	self.cancelSaveCustomer = function() {

		//  Initialize selected customer data
		// Set indicator to display all customers
		initializeSelectedCustomer();
		self.displayedPage(self.displayPageAllCustomers());
	};

  // Delete customer
  self.deleteCustomer = function(customer) {
		if (confirm('Are you sure you want to delete customer ' +
							customer.FirstName() + ' ' +
									customer.LastName() + '?') == true) {

				$.ajax({
					type: 'DELETE',
					url: apiURL + customersURLString + '/' + customer.CustomerId(),
					success: function(data) {
											toastr.error('Customer ' +
																customer.FirstName() + ' ' +
																		customer.LastName() + ' was deleted');

							// Remove the customer from the displayed customer table
					    self.customersTable.remove(customer);
							initializeSelectedCustomerAccounts();
					}
					});
		}
 };

  // Populate the customer table array from the customer table in the DB
  self.reload = {
		customers: function() {
 	 		$.ajax({
 		 					type: 'GET',
 		 				  url: apiURL + customersURLString,
 		 					success: function(data) {
 			 					ko.mapping.fromJS(data, {}, self.customersTable);
 		 					}
 	 		});
  	}
	};

	// Validate the data entered in  selectedCustomer fields
	// Return true if fields not allowed to be null are not null,
	//  otherwise return false and output message
  function validateCustomer() {

		// Validate that the following are not null: first name, last name,
		//  address1, city, state
		if (self.selectedCustomer.FirstName() == null ||
					self.selectedCustomer.LastName() == null ||
					self.selectedCustomer.Address1() == null ||
					self.selectedCustomer.City() == null ||
					self.selectedCustomer.State() == null) {
				toastr.warning('The following fields cannot be empty: ' +
														'First Name, Last Name, Address(1), City, State',
														'Required Field(s) Empty');
				return false;
		}
		else {
			return true;
		}
  }

 // Read the accounts for the customer,
 //  and map them to selectedCustomerAccounts
 // If accounts can't be read, initialize selectedCustomerAccounts
 // Return the length of selectedCustomerAccounts array

 function getCustomerAccounts(customer) {
	 $.ajax({
		 type: 'GET',
		 url: apiURL + customersURLString + '/' + customer.CustomerId() + accountsURLString,
		 success: function(data) {
			 ko.mapping.fromJS(data, {}, self.selectedCustomerAccounts);
		 },
		 error: function(jqXHR, textStatus, errorThrown) {
			 initializeSelectedCustomerAccounts();
			 //if(jqXHR.status == 404 || errorThrown == 'Not Found') {}
		 }
	 });

	 return self.selectedCustomerAccounts().length;
 }

 // Initialize selectedCustomerAccounts
 function initializeSelectedCustomerAccounts() {

	 self.selectedCustomerAccounts.removeAll();

	 return true;
 }

	 // Initialize selectedCustomer & selectedCustomerAccounts
	 function initializeSelectedCustomer() {

		 self.selectedCustomer.CustomerId(0);
		 self.selectedCustomer.FirstName(null);
		 self.selectedCustomer.LastName(null);
		 self.selectedCustomer.Address1(null);
		 self.selectedCustomer.Address2(null);
		 self.selectedCustomer.City(null);
		 self.selectedCustomer.State(null);
		 self.selectedCustomer.Zip(null);

		 initializeSelectedCustomerAccounts();

		 return true;
	 }

	 // Push new customer to customer table arrray
	 function pushNewCustomer() {

		 var newCustomer = ko.mapping.fromJS(ko.mapping.toJS(self.selectedCustomer));
		 self.customersTable.push(newCustomer);

		 return true;
	 }

	   // After all definitions are done, display the customers
	   self.reload.customers();


}; // End AppViewModel

ko.applyBindings(new AppViewModel());
