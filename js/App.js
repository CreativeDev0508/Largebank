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
  self.selectedCustumberNumberOfAccounts = ko.observable(0); // Number of accounts belonging to customer

  // Display all customers: displayedPage == 'customer.grid'
  // Populate the customer table array
  $.ajax({
		type: 'GET',
		url: apiURL + customersURLString,
		success: function(data) {
			ko.mapping.fromJS(data, {}, self.customersTable);
		}
	});

	  // Initialize selectedCustomer
	  function initializeSelectedCustomer() {

	    self.selectedCustomer.CustomerId(0);
	    self.selectedCustomer.FirstName('');
	    self.selectedCustomer.LastName('');
	    self.selectedCustomer.Address1('');
	    self.selectedCustomer.Address2('');
	    self.selectedCustomer.City('');
			self.selectedCustomer.State('');
	    self.selectedCustomer.Zip('');

	    self.selectedCustumberNumberOfAccounts(0);

	    return true;
	  }

  // Add customer
  self.addCustomer = function() {
		initializeSelectedCustomer();
    self.displayedPage(self.displayPageAddCustomer());
  };

  // Edit customer
  self.editCustomer = function(customer) {

    // Get customer and account data
    var customerURL = apiURL + customersURLString + '/' + customer.CustomerId();
    $.ajax({
  		type: 'GET',
  		url: customerURL,
  		success: function(data) {
  			ko.mapping.fromJS(data, {}, self.selectedCustomer);

        // Get customer's accounts (there might be no accounts)
        $.ajax({
      		type: 'GET',
      		url: customerURL + accountsURLString,
      		success: function(data) {
      			ko.mapping.fromJS(data, {}, self.selectedCustomerAccounts);

            self.selectedCustumberNumberOfAccounts(self.selectedCustomerAccounts().length);
      		},
          error: function(jqXHR, textStatus, errorThrown) {
            self.selectedCustumberNumberOfAccounts(0);
            if(jqXHR.status == 404 || errorThrown == 'Not Found')
            {
            }
          }
      	});

		    //   set indicator to switch to edit customer page
        self.displayedPage(self.displayPageEditCustomer());

  		}
  	});

  };

	// Push new customer to customer table arrray
  function pushNewCustomer() {

		var newCustomer = ko.mapping.fromJS(ko.mapping.toJS(self.selectedCustomer));
		self.customersTable.push(newCustomer);

    return true;
  }

  // Save new or edited customer
  self.saveCustomer = function() {

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

          alert('Customer ' + self.selectedCustomer.FirstName() + ' ' +
                  self.selectedCustomer.LastName() + ' was successfully added');

          //  Set indicator to display all customers
          self.displayedPage(self.displayPageAllCustomers());

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

          alert('Customer ' + self.selectedCustomer.FirstName() + ' ' +
                  self.selectedCustomer.LastName() + ' was successfully updated');

          // Set indicator to display all customers
          self.displayedPage(self.displayPageAllCustomers());
        }
      });

    }
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
											alert('Customer ' +
																customer.FirstName() + ' ' +
																		customer.LastName() + ' was deleted');
					}
				});

		}

  };

}; // End AppViewModel

ko.applyBindings(new AppViewModel());
