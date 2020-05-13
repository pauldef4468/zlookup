function submitSignUpForm(){
	
	//*** SIGN UP SUBMIT FUNCTION ***
	
	var form = $('#sign_up_form');
	
	//Remove any errors if there are some
	$(form).find(".form-group").removeClass('has-error');
	$(form).find(".help-block").remove();
	
	var firstName = $(form).find(".first_name").val();
	var lastName = $(form).find(".last_name").val();
	var email = $(form).find(".your_email").val();
	var password = $(form).find(".password").val();
	var confirmPassword = $(form).find(".confirm_password").val();
	
	var formData = {
		'firstName':firstName,
		'lastName':lastName,
		'email':email,
		'password':password,
		'confirmPassword':confirmPassword
	}
	
	// *** Ajax post the form data ***
	$.ajax({url: "http://localhost:5000/zlookup-api/users", 
		type: "POST",
		data: JSON.stringify(formData), 
		dataType: "json", 
		contentType:"application/json; charset=utf-8"
	})
	.done(function(responseData){
		//All is good here because status code will be 200 else it will drop down to .fail below
		showLoginForm();
	})
	.fail(function(responseData, textStatus, error){

		const statusCode = responseData.status;
		if(statusCode === 400){
			const propertyKey = responseData.responseJSON.context.key; //property name on server (JOI validation, look at the model)
			const errorMessage = responseData.responseJSON.message;
			switch(propertyKey){
				case 'firstName':
					const firstNameGroup = $(form).find(".reg_first_name");
					$(firstNameGroup).addClass('has-error'); 
					$(firstNameGroup).append('<div class="help-block">' + errorMessage + '</div>'); 
					break;
				case 'lastName':
					const lastNameGroup = $(form).find(".reg_last_name");
					$(lastNameGroup).addClass('has-error'); // add the error class to show red input
					$(lastNameGroup).append('<div class="help-block">' + errorMessage + '</div>'); 
					break;
				case 'email':
					const emailGroup = $(form).find(".reg_email");
					$(emailGroup).addClass('has-error'); // add the error class to show red input
					$(emailGroup).append('<div class="help-block">' + errorMessage + '</div>'); 
					break;
				case 'password':
					var confirmPasswordGroup = $(form).find(".reg_password");
					$(confirmPasswordGroup).addClass('has-error'); // add the error class to show red input
					$(confirmPasswordGroup).append('<div class="help-block">' + errorMessage + '</div>'); 
					break;
				case 'confirmPassword':
					var confirmPasswordGroup = $(form).find(".reg_confirm_password");
					$(confirmPasswordGroup).addClass('has-error'); // add the error class to show red input
					$(confirmPasswordGroup).append('<div class="help-block">' + errorMessage + '</div>'); 
					break;
				default:
					// TODO Handle some other error here
					break;
			}
 
		}else{
			// TODO finish this
			console.log('Status code: ' + statusCode);
		}

	})
	
}

function submitLoginForm(){
	
	var form = $('#login_form');
	
	//Remove any errors if there are some
	$(form).find(".form-group").removeClass('has-error');
	$(form).find(".help-block").remove();
	
	var loginEmail = $(form).find(".login_email").val();
	var loginPassword = $(form).find(".login_password").val();
	
	var formData = {
		'loginEmail':loginEmail,
		'loginPassword':loginPassword
	}
	
	$.post('php/login.php',formData, function(responseData){
		
		if(!responseData.success){
			
			//Show any form errors
			
			var loginEmailGroup = $(form).find(".log_login_email");
			if(responseData.errors.loginEmail){
				$(loginEmailGroup).addClass('has-error'); 
				$(loginEmailGroup).append('<div class="help-block">' + responseData.errors.loginEmail + '</div>'); 
			}
			var loginPasswordGroup = $(form).find(".log_login_password");
			if(responseData.errors.loginPassword){
				$(loginPasswordGroup).addClass('has-error'); // add the error class to show red input
				$(loginPasswordGroup).append('<div class="help-block">' + responseData.errors.loginPassword + '</div>'); 
			}
			
			if(responseData.errors.misc){
				console.log(responseData.errors.misc);
				alert(responseData.errors.misc);
			}
		}else{
			
			//All is good
			showSearchBlock();
			//Load data
			loadInitialData();
			//Show logout menu button
			$('#logout_menu_item').css("display", "block");
			//Hide login menu button
			$('#login_menu_item').css("display", "none");
			//display user name id is user_info
			var displayName = "Hello " + responseData.user.firstName + " " + responseData.user.lastName;
			$('#user_info').html(displayName);
		}
	},'json')
	.fail(function(responseData, textStatus, error){
	
		//Show the error information
		console.error("submitSignUpForm failed, status: " + textStatus + ", error: " + error);
		alert('submitSignUpForm failed. Check logs');

	})
	
}
function loadInitialData(){
	
	//*** Load data from server ***
	
	//Empty items array
	items = [];
	//Empty categories array
	categories = [];
	
	//Empty the result array
	resultItems = [];
	
	//Empty the selected paragraph
	selectedParId = '';
	
	//Clear results in the result table
	var tableBody = document.getElementById("tbody");
	tableBody.innerHTML = '';
	
	hideSearchBlock();
	
	//Make web call to get all initial data
	$.getJSON('php/getAllData.php', function (responseData) {
	//$.getJSON('http://localhost:5000/zlookup-api/comments', function (responseData) {
		if(responseData.loggedin){
			//Show the logout menu button
			$('#logout_menu_item').css("display", "block");
			////Hide the login menu button
			$('#login_menu_item').css("display", "none");
			//set the user_info html
			var displayName = "Hello " + responseData.user.firstName + " " + responseData.user.lastName;
			$('#user_info').html(displayName);
			//Loop each comment item returned
			$(responseData.items).each(function(){
			//Get the created by user name
			var createdByUserName = this.firstName + " " + this.lastName;
			var item = new Item(this.component_name,
				this.item_name,
				this.comment,
				this.price,
				this.original_flag,
				this.id,
				this.categoryID,
				createdByUserName
				);
			items.push(item);
			});

			//Get the categories array of category objects
			categories = responseData.categories;
			loadCategories();
			showSearchBlock();
		}else{
			//Not logged in. Switch to login screen.
			$('#user_info').html('');
			showLoginForm();
		}
		
		
	})
	.fail(function(responseData, textStatus, error){
		//This can mean invalid JSON returned or error on server
		console.error("getAllData failed, status: " + textStatus + ", error: " + error)
		//console.log(data);
		alert('getAllData failed.');
	});
	
}

function formSubmitUpdate(e, row, selectedItem){
	
	//*** UPDATE THE ITEM COMMENT ***
		
	//Remove any error displays if there are some
	clearEditFormErrors(row);
	//get reference this edit form
	var form = $(row).find(".pad_form");
	//Set the data object we will send to server
	var formData = setFormDataObj(row, selectedItem);
	
	//Show a spinner
	showHideEditFormSpinner(row,true);
	
	//Post the update
	$.post('php/update.php',formData, function(data){
		
		if(!data.success){
			//Hide the spinner
			showHideEditFormSpinner(row,false);
			if(!data.loggedin){
				//This should never be able to happen
				alert('Not logged in');
			}
			//Show any form input errors returned from the server
			showEditFormInputErrors(row, data);

			if(data.errors.other){
				closeEditFormDiv('', form);
				//console.log(data.errors.other);
				alert(data.errors.other);
			}

			
		}else{
			//*** Update Success!!!
			//Update the comment "Item" object with the new values
			selectedItem.componentName = formData.componentName;
			selectedItem.name = formData.renoWalkName;
			selectedItem.comment = formData.comment;
			selectedItem.price = formData.price;
			selectedItem.categoryID = formData.categoryID;

			//Update the item display html 
			$(row).find(".component").html(htmlspecialchars(selectedItem.componentName));
			//$(row).find(".commentName").html(selectedItem.name);
			$(row).find(".commentName").html(htmlspecialchars(selectedItem.name));
			//$(row).find(".commentText").html(selectedItem.comment);
			$(row).find(".commentText").html(htmlspecialchars(selectedItem.comment));
			// TODO2 this next line should really produce properly formatted currency
			$(row).find(".money").html(htmlspecialchars(selectedItem.price));
			
			//Close the edit form and then re-filter and display 
			closeEditFormDiv('', form);
			
		}
	},'json')
	.fail(function(data, textStatus, error){
		
		closeEditFormDiv('', form);
		//Show the error information
		console.error("formSubmitUpdate failed, status: " + textStatus + ", error: " + error);
		alert('formSubmitUpdate failed. Check logs');

	})
		

}

function formSubmitSaveAs(row, selectedItem){
		
	//*** Save new record based on existing selected record ***
	
	//Remove any error displays if there are some
	clearEditFormErrors(row);
	//get reference this edit form
	var form = $(row).find(".pad_form");
	//Set the data object we will send to server
	var formData = setFormDataObj(row, selectedItem);
	//Show a spinner
	showHideEditFormSpinner(row,true);

	//Post the new record
	$.post('php/insertNewItem.php',formData, function(data){
		
		if(!data.success){
			//Hide the spinner
			showHideEditFormSpinner(row,false);
			if(!data.loggedin){
				//This should never be able to happen
				alert('Not logged in');
			}
			//Show any form input errors returned from the server
			showEditFormInputErrors(row, data);

			if(data.errors.other){
				closeEditFormDiv('', form);
				//console.log(data.errors.other);
				alert(data.errors.other);
			}

			
		}else{
			// Need to return the id or the object itself
			//console.log(data.newRecordID);
			var item = new Item(
				formData.componentName,
				formData.renoWalkName,
				formData.comment,
				formData.price,
				1,
				data.newRecordID,
				formData.categoryID,
				selectedItem.createdByUserName
				);
			items.push(item);
			
			//Close the edit form and then re-filter and display 
			closeEditFormDiv('', form);
			
		}
	},'json')
	.fail(function(data, textStatus, error){
		
		closeEditFormDiv('', form);
		//Show the error information
		console.error("formSubmitUpdate failed, status: " + textStatus + ", error: " + error);
		alert('formSubmitUpdate failed. Check logs');

	})
}

function deleteItem(row, selectedItem){
		
	//*** Delete ***
	
	//Remove any error displays if there are some
	clearEditFormErrors(row);
	//get reference to this edit form
	var form = $(row).find(".pad_form");
	//Set the data object we will send to server
	var formData = {'recordID':selectedItem.databaseID};
	//Show a spinner
	showHideEditFormSpinner(row,true);

	//Delete record on server
	$.post('php/deleteItem.php',formData, function(data){
		
		if(!data.success){
			//Hide the spinner
			showHideEditFormSpinner(row,false);
			if(!data.loggedin){
				//This should never be able to happen
				alert('Not logged in');
			}

			if(data.errors.other){
				closeEditFormDiv('', form);
				//console.log(data.errors.other);
				alert(data.errors.other);
			}

			
		}else{
			//Successfully deleted
			//Delete from the items array
			deleteItemByRecordID(selectedItem.databaseID);
			
			//Close the edit form and then re-filter and display 
			closeEditFormDiv('', form);
			

			
		}
	},'json')
	.fail(function(data, textStatus, error){
		
		closeEditFormDiv('', form);
		//Show the error information
		console.error("Delete failed, status: " + textStatus + ", error: " + error);
		alert('deleteItem failed. Check logs');

	})
}

function logout(){

	console.log('logout');
	
	$.getJSON('php/logout.php', function (responseData) {
		if(!responseData.success){
			
			if(responseData.errors.misc){
				//console.log(responseData.errors.misc);
				alert(responseData.errors.misc);
			}
		}else{
			//Logged out
			//Clean up any open edit forms in the search block
			//Delete any data downloaded when logging in and / or loading data
			$(".pad_form").remove();
			//Empty the result array
			resultItems = [];
			//Empty the main items array
			items = [];
			//Empty the categories array
			categories = [];
			//Remove the logout menu button
			$('#logout_menu_item').css("display", "none");
			//Show the login menu button
			$('#login_menu_item').css("display", "block");
			//remove the user info html at .user_info paragraph
			$('#user_info').html('');
			//
			showLoginForm();
		}
		
	})
	.fail(function(responseData, textStatus, error){
		console.error("submitSignUpForm failed, status: " + textStatus + ", error: " + error);
		alert('logout failed. Check logs');
	});
	
}