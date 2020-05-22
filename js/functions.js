

function commentClick2(par,text){
	
	//If something already selected then unselect it
	if(selectedParId){
		$('#' + selectedParId).css("background-color", "")
	}
	//Set the background color of the selected paragraph element
	var id = $(par).attr('id');
	$('#' + id).css("background-color", "yellow");
	//Remember the selected id
	selectedParId = id;
	
	//Copy the p element clicked on to the clipboard
	const el = document.createElement('textarea');
	//el.value = par.innerHTML;
	el.value = text;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();
	//el.setSelectionRange(0, 99999); //It doesn't look like I need this
	document.execCommand('copy');
	document.body.removeChild(el);
	
	
}

function updateClipboard(text) {
	const el = document.createElement('textarea');
	//el.value = par.innerHTML;
	el.value = text;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();
	//el.setSelectionRange(0, 99999); //It doesn't look like I need this
	document.execCommand('copy');
	document.body.removeChild(el);
  }


function reloadFunction(){
	//Completely refresh page from server
	location.reload(true);
}

function ajaxItems(){

	return new Promise((resolve, reject) => {

		// The global user object is not set when not logged in
		let token = '';
		if(user){
			token = user.token;
		}

		//Call async function here
		let respItems = [];

		//=============================
		//$.ajax({url: "http://localhost:5000/zlookup-api/items", 
		$.ajax({url: `${apiServer}/zlookup-api/items`, 
			type: "GET",
			//This below was messing with CORS (Cross Origin Resource Sharing) somehow
			// xhrFields: {
			// 	withCredentials: true
			//  },
			headers: { 'x-auth-token': token },
			dataType: "json", 
			contentType:"application/json; charset=utf-8"
		})
		.done(function (responseItems, status, xhr){

			//Loop each comment item returned
			$(responseItems).each(function(){
			//Get the created by user name
			// var createdByUserName = this.firstName + " " + this.lastName;
			var item = new Item(this.componentName,
				this.itemName,
				this.comment,
				this.price,
				this.originalFlag,
				this._id,
				this.categoryID,
				this.modifiedByUserID,
				this.createdByUserID,
				this.createdDateTime
			);
				respItems.push(item);
			});
			resolve(respItems);

		})
		.fail(function(responseData, textStatus, error){
			reject(responseData);
	
		});

	})
}

function loadInitialData(){
	
	//*** Load data from server ***
	
	//Initialize these global arrays
	items = [];
	categories = [];
	resultItems = [];
	selectedParId = '';

	return new Promise((resolve, reject) => {

		async function submitAjaxRequests(){
			try{
				//Load items and category arrays
				items = await ajaxItems();
				categories = await ajaxCategories();
				resolve();
			}
			catch(err){
				const errorType = err.responseJSON.errorType;
				const tokenErrorMessage = checkTokenErrorType(errorType);
				if(tokenErrorMessage){
					console.error(tokenErrorMessage);
				}else{
					console.error(err);
				}
				reject();
			}
		}

		submitAjaxRequests();
	});
	
}

function checkTokenErrorType(errorType){

	if(errorType === 'undefined' || null){
		return null;
	}

	if(errorType === 'token_missing'){
		return {message: 'Token missing'};
	}else if(errorType === 'token_invalid'){
		return {message: 'Token invalid'};
	}else if(errorType === 'token_expired'){
		return {message: 'Token expired'};
	}else{
		return null;
		//throw new Error('Problem checking error type');
	}


}

function ajaxCategories(){

	return new Promise((resolve, reject) => {

		let token = '';
		if (user) {
			token = user.token;
		}

		//Make web call to get all initial data

		// $.ajax({url: "http://localhost:5000/zlookup-api/categories", 
		$.ajax({url: `${apiServer}/zlookup-api/categories`,
		type: "GET",
		headers: { 'x-auth-token': token },
		dataType: "json", 
		contentType:"application/json; charset=utf-8"
		})
		.done(function(responseCategories, status, xhr){
			resolve(responseCategories)
			
		})
		.fail(function(responseData, textStatus, error){
			reject(responseData);
		});

	});
	
}

function loadCategories(){
	let option = '';
	$('#category_select').empty();
	for (let i=0;i<categories.length;i++){
		let itemCount = getItemCountPerCategory(categories[i]);
		option += `<option value="${categories[i]._id}">${categories[i].name} - ${itemCount}</option>`;
	}
	$('#category_select').append(option);
}

function updateCategoryCounts(){
	$("#category_select > option").each(function() {
		let category = getCategoryByID(this.value);
		let itemCount = getItemCountPerCategory(category);
		this.text = `${category.name} - ${itemCount}`;

	});
}

function getCategoryByID(id){
	return categories.find(category => category._id === id);
}


function getItemCountPerCategory(category){
	let count = 0;
	for (let i=0;i<items.length;i++){
		if(items[i].category._id === category._id) count++;
	}
	return count;
}

function loadFormCategories(categoryID){
	var option = '';
	var currentSelectionID = 0;
	for (var i=0;i<categories.length;i++){
	   option += '<option value="'+ categories[i]._id + '">' + categories[i].name + '</option>';
	   if(categoryID == categories[i]._id){
		   currentSelectionID = categoryID;
	   }
	}
	$('.form_category_select').append(option);
	//Set the category drop down selected item
	$(".form_category_select").val(currentSelectionID);
}


function notReadyFunction(){
	alert("Sorry! This doesn't do anything yet.");
}


function lookupFunction() {

	var categoryID = $('#category_select option:selected').val();
	
	if (!Array.isArray(items) || !items.length) {
	  // array does not exist, is not an array, or is empty
	  $("#lookup_error").css("display", "block");
	  $("#lookup_error").html("No items. You probably need to login?");

	}else{
	  $("#lookup_error").css("display", "none");
	  $("#lookup_error").html("");
	}

	//Clean up any open edit forms
	$(".pad_form").remove();
	//Empty the result array
	resultItems = [];
	//Clear results in the result table
	$('#tbody').html('');
	//Clear the result count display
	$("#result_count").html("");
	
	
	//See if the all checkbox is checked.
	var allChecked = document.getElementById("all_checkbox").checked;
	
	//Get the lookup textbox value for each key stroke
	//var lookupText = document.getElementById("lookupText").value;
	var lookupText = $('#lookupText').val();
	
	//We should have a bunch of "items" at this time
	var lookupWords = lookupText.split(" ");
		
	//Loop the items array and add to the resultItems array if not filtered out
	var i;
	for (i = 0; i < items.length; i++) {
		
		var componentName = items[i].componentName;
		var comment = items[i].comment;
		var name = items[i].name;
		var originalFlag = items[i].originalFlag;
		
		if(categoryID != items[i].category._id){continue};
		
		//If not an original or custom comment then don't include
		//*** THIS WILL BE A CHECKBOX LATER OR SOMETHING ***
		//if(originalFlag == "0"){continue;}
		
		//If the original flag is zero and all checked 
		if(!allChecked && originalFlag == "0"){continue;}
		
		//Lookup everything if nothing there 
		if(lookupText == ""){
			resultItems.push(items[i]);
			continue;
		}
		
		//Loop for each lookup word and ignore empty string in case of double spaces
		var found = false;
		var icount;
		for (icount = 0; icount < lookupWords.length; icount++) {
			if(!lookupWords[icount]){continue;} //Check for empty string
			
			//Search for this lookup word case insensitive
			var combined = name + " " + comment + " " + componentName;
			
			//var n = combined.toLowerCase().search(lookupWords[icount].toLowerCase()); //I took this out (looks for regular expression
			var n = combined.toLowerCase().indexOf(lookupWords[icount].toLowerCase());
			//if(n == -1){continue};
			if(n == -1){
				found = false;
				break;
			}
			found = true;
		}
		if(!found){continue;}
		
		resultItems.push(items[i]);
		
	}
	
	
	// *** LOAD THE TABLE ***
	//var table = $("#resultTable");

	//Clear results in the result table
	var tableBody = document.getElementById("tbody");
	
	//tableBody.innerHTML = '';
	
	//Clear the selected paragraph 
	selectedParId = '';
	
 	var i;
	var rowCount = 0;
	
	$("#result_count").html(resultItems.length);
	
	for (i = 0; i < resultItems.length; i++) {
		
		rowCount = rowCount + 1;
		
		var row = tableBody.insertRow();
		var rowId = 'R' + i;
		row.setAttribute("id", rowId);
		row.setAttribute("class", "result_row");
		
		//Insert cell
		var cell0 = row.insertCell(0);
		var span = $("<span class='glyphicon glyphicon-chevron-down edit_icon'></span>");
		//$(editIcon).html(span);
		//$(cell0).append(editIcon);
		$(cell0).append(span);
		//$(cell0).append(plus);
		
		//Event handler for pencil click
		$(span).on('click', (function(span){
			return(function() { 
				showEditForm2(span); 
			});
		})(span));
		
		//Insert comment cell
		var cell1 = row.insertCell(1);
		$(cell1).attr("class", "cell1");
		
		//*** Component Name *** ie. Exterior, Bedroom, Kitchen, etc
		var parComponentName = document.createElement("p");
		parComponentName.setAttribute("class", "name component");
		//Convert to html entities so the browser doesn't process any html type chars
		var parComponentNameText = htmlspecialchars(resultItems[i].componentName);
		parComponentName.innerHTML = parComponentNameText;
		cell1.appendChild(parComponentName)
		
		//*** Heading Text AKA Comment Name ***
		var headId = 'H' + i;
		var parHeading = document.createElement("p");
		parHeading.setAttribute("class", "name touch commentName");
		parHeading.setAttribute("id", headId);
		//Convert to html entities so the browser doesn't process any html type chars
		var parHeadingText = htmlspecialchars(resultItems[i].name);
		//Highlight
		parHeading.innerHTML = highlight(parHeadingText, lookupWords);
		//parHeading.innerHTML = parHeadingText;
		cell1.appendChild(parHeading)
		
		//*** Comment Text ***
		var textId = 'T' + i;
		var par = document.createElement("p");
		par.setAttribute("class", "touch commentText");
		par.setAttribute("id", textId);
		//Convert to html entities so the browser doesn't process any html type chars
		var parCommentText = htmlspecialchars(resultItems[i].comment);
		//Highlight the search words in the par element
		par.innerHTML = highlight(parCommentText, lookupWords);
		cell1.appendChild(par);
		
		//*** Add price ***
		let priceEl = $(cell1).append('<p class="price_display">Price: ' + resultItems[i].price + '</p>');
		
		//Set event handlers to copy data to clipboard
		var nameText = resultItems[i].name;
		parHeading.onclick = function(parHeading, nameText){
			return(function() { 
				commentClick2(parHeading, nameText); 
			});
		}(parHeading, nameText);
		
		var commentText = resultItems[i].comment;
		par.onclick = function(par,commentText){
			return(function() { 
				commentClick2(par,commentText); 
			});
		}(par,commentText);

		const resultItem = resultItems[i];

		if(resultItem.category.name === 'Externalities' || resultItem.category.name === 'Internalities' || resultItem.category.name === 'Notes'){
			//Add the plus icon to add this note to appropriate section
			let plus = $('<button type="button" class="btn btn-success btn-sm" id="add_comment_button">Add to List</button>');
			$(cell1).append(plus);
			$(plus).on('click', (function(resultItem){
				return(function() { 
					if(resultItem.category.name === 'Externalities'){
						let externalitiesValue = localStorage.getItem('externalities');
						if(!externalitiesValue){
							localStorage.setItem('externalities',resultItem.comment);
						}else{
							externalitiesValue = externalitiesValue.concat('\n' + resultItem.comment);
							localStorage.setItem('externalities',externalitiesValue);
						}
						
					}else if(resultItem.category.name === 'Internalities'){
						
					}else if(resultItem.category.name === 'Notes'){
						let notesValue = localStorage.getItem('notes');
						if(!notesValue){
							localStorage.setItem('notes',resultItem.comment);
						}else{
							notesValue = notesValue.concat('\n' + resultItem.comment);
							localStorage.setItem('notes',notesValue);
						}
					}
					
				});
			})(resultItem));
		}

			
		
		
/* 		//Insert price cell
 		var cell2 = row.insertCell(2);
		cell2.setAttribute("class", "money");
		cell2.innerHTML = resultItems[i].price; */
		


	}
	

	
}

function highlight(textToProcess, lookupWordsArray){
	//Highlight the search words in the par element
	var icount;
	var newText = textToProcess;
	for (icount = 0; icount < lookupWordsArray.length; icount++) {
		//I have no idea how this works but I found online to replace everything 
		//outside html tags only so it doesn't keep clobbering itself
		var searchstring = lookupWordsArray[icount].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		var regex = new RegExp("(" + searchstring + ")(?!([^<]+)?>)", "gi");
		newText = newText.replace(regex,'<span class="highlight">$&</span>');
	}
	return newText;
}

function editFunction(){
	
	//*** DO NOT DELETE YET ***
	
	//See if any rows have checkmarks checked. We should only have one.
	//When we have a single checked checkmark then get the row element.
	
	
	//Loop all checkboxes and build array of checked = true only
	var checkboxes = $( ".row_checkbox" ).get();
	
	var i;
	var checkedBoxesArr = [];
	for (i = 0; i < checkboxes.length; i++){
		if(checkboxes[i].checked){
			checkedBoxesArr.push(checkboxes[i]);
		}
	}
	
	//Make sure we only have one
	if(checkedBoxesArr.length == 0){
		alert('None selected');
		return;
	}else if(checkedBoxesArr.length > 1){
		alert('Please select only one');
		return;
	}
	
	
	//Get this checkboxes parent table row
	var checkbox = checkedBoxesArr[0];
	var row = $( checkbox ).parents(".result_row");
	var rowIdStr = $(row).attr('id');


	//Get the number only from the id
	var str = rowIdStr.replace ( /[^\d.]/g, '' );
	var resultItemIndex = parseInt(str);
	
	//Set global selectedItem
	selectedItem = resultItems[resultItemIndex];
	
	//Load a form with 
	showEditForm();
	
}

function showEditForm(){
	
/* 	//Show the form
	$('#pad_form').slideDown();
	
	//Fill in the form 
	$('#component_name').val(selectedItem.componentName);
	$('#item_name').val(selectedItem.name);
	$('#item_comment').html(selectedItem.comment); */
	
}

function showEditForm2(spanElement){
	
	
	//Get this checkboxes parent table row
	var row = $( spanElement ).closest(".result_row");
	
	//Get cell1 (has comment, name, etc.
	var cell1 = $(row).find(".cell1");
	
	//Get the form div
	var editFormDiv = $(row).find(".pad_form");
	
	//If the edit form already exists in the cell then close it and return
	if($(row).find(".pad_form").length){
		
		closeEditFormDiv('', editFormDiv);
		
		return;
	}
	
	//Only allow one open at a time. I had to do this because of problems with AutoNumeric
	if($('.pad_form').length)return;
	
	//Toggle the chevron
	var chevron = $(row).find('.edit_icon');
	chevron.toggleClass('glyphicon-chevron-down').toggleClass('glyphicon-chevron-up');
	
	//Get the id of the row
	var rowIdStr = $(row).attr('id');
	
	//Get the number only from the id
	var str = rowIdStr.replace ( /[^\d.]/g, '' );
	var resultItemIndex = parseInt(str);
	//The current Item 
	var selectedItem2 = resultItems[resultItemIndex];

	//console.log(items[0].comment);
			
	// TODO2 - Add an additional comment option to the form
			
	//Create the edit form div and start out not displayed
	var editFormDiv = $('<div style="display: none;" class="pad_form">' +
	'<form class="edit_form" action="..blah" method="post">' +
		'<select class="form_category_select"></select>' +
	
		'<div id="component_name_group" class="form-group">' +
			'<label for="component_name" class="renowalk_component">RenoWalk Component:</label>' +
			'<input type="text" class="form-control component_name" id="component_name">' +
		 '</div>' +
	  
		'<div id="comment_name_group" class="form-group">' +
			'<label for="comment_name" class="renowalk_comment_label">RenoWalk Comment Name:</label>' +
			'<input type="text" class="form-control comment_name" id="comment_name">' +
		'</div>' +
		
		'<div id="item_comment_group" class="form-group">' +
			'<label for="item_comment">Comment:</label>' +
			'<textarea class="form-control rounded-0 item_comment" id="item_comment" rows="4"></textarea>' +
		'</div>' +
		'<div id="item_price_group" class="form-group">' +
			'<label for="item_price">Price:</label>' +
			'<input type="tel" class="form-control item_price" id="item_price">' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-sm-6"><span class="database_id_label">Record ID: </span><span class="database_id"></span></div>' +
			'<div class="col-sm-6 text-right created_by"></div>' +
		'</div>' +
		
		'<button type="button" class="btn btn-success btn-sm save_button">Save</button>' +
		'<button type="button" class="btn btn-success btn-sm save_new_button">Save As</button>' +
		'<button type="button" class="btn btn-danger btn-sm delete_button">Delete</button>' +
		
		'<button type="button" class="btn btn-warning pull-right btn-sm cancel_button">Cancel</button>' +
		'<div class="bg-danger text-danger panel-body standard_err_message"></div>' +

	  
	'</form>' +

	//Intitially hidden overlay for spinner
	'<div class="pad_overlay">' +
		'<div class="loader" >' +
		'</div>' +
	'</div>' + 
	'</div>');
	
	$(editFormDiv).appendTo($(cell1)).slideDown();
	
	
	//I could not get this AutoNumeric stuff to work with multiple dynamically loaded forms so I only allow one at a time above
	 const autoNumericOptions = {
			allowDecimalPadding: "floats",
			decimalCharacter: ".",
			digitGroupSeparator: ",",
			emptyInputBehavior: "zero",
			watchExternalChanges: true 
		};
	//anItemPrice = new AutoNumeric.multiple('.item_price',AutoNumeric.getPredefinedOptions().NorthAmerican);
	anItemPrice = new AutoNumeric.multiple('.item_price',autoNumericOptions);

	//Load the categories from the global categories array
	loadFormCategories(selectedItem2.category._id);
	
	//Fill in the form 
	var componentName = $(editFormDiv).find(".component_name");
	componentName.val(selectedItem2.componentName);
	var name = $(editFormDiv).find(".comment_name");
	name.val(selectedItem2.name);
	var comment = $(editFormDiv).find(".item_comment");
	comment.val(selectedItem2.comment);
	//Comments table record ID
	$(editFormDiv).find(".database_id").html(selectedItem2.id);
	//Fill in the amount
	var price = $(editFormDiv).find(".item_price");
	price.val(selectedItem2.price);
	
	
	//Register the save button click event
	var saveButton = $(editFormDiv).find(".save_button");
	$(saveButton).on('click', function(e){
		formSubmitUpdate(e,row, selectedItem2);
	});
	
	//Register the save new button click event
	var saveNewButton = $(editFormDiv).find(".save_new_button");
	$(saveNewButton).on('click', function(){
		formSubmitSaveAs(row, selectedItem2);
	});	
	
	//Register the delete button click event
	var deleteButton = $(editFormDiv).find(".delete_button");
	$(deleteButton).on('click', function(){
		deleteItem(row, selectedItem2);
	});	
	
	const fullName = selectedItem2.createdByUser.firstName + ' ' + selectedItem2.createdByUser.lastName;
	$(editFormDiv).find(".created_by").html('Created By: ' + htmlspecialchars(fullName));
	
/* 	//Register the cancel button click event
	var cancelButton = $(row).find(".cancel_button");
	$(cancelButton).on('click', function(e){
		closeEditFormDiv(e);
	}); */
	
	var cancelButton = $(row).find(".cancel_button");
	$(cancelButton).on('click', function(e){
		closeEditFormDiv(e, editFormDiv);
	});
	


};

function clearEditFormErrors(row){
	//Remove any errors if there are some
	$(row).find(".form-group").removeClass('has-error');
	$(row).find(".help-block").remove();
}

function setFormDataObj(row, selectedItem){
	//Use AutoNumeric to get raw price number
	let anRawPrice = AutoNumeric.getAutoNumericElement('.item_price').getNumericString();
	anRawPrice = parseFloat(anRawPrice);
	
	//The categoryID is stored in the value of the category Select element
	const formCategorySelectValue = $(row).find(".form_category_select").val();
	
	//Set the formData object to send to server
	return {
		'componentName':$(row).find(".component_name").val(),
		'itemName':$(row).find(".comment_name").val(),
		'comment':$(row).find(".item_comment").val(),
		'price':anRawPrice,
		'categoryID':formCategorySelectValue,
		//'createdByUserID':user.id,
		//'modifiedByUserID': user.id
	}
}

function setFormSubmitSaveAsObj(row, selectedItem){

	//Use AutoNumeric to get raw price number
	let anRawPrice = AutoNumeric.getAutoNumericElement('.item_price').getNumericString();
	anRawPrice = parseFloat(anRawPrice);
	
	//The categoryID is stored in the value of the category Select element
	const formCategorySelectValue = $(row).find(".form_category_select").val();
	
	//Set the formData object to send to server
	return {
		'componentName':$(row).find(".component_name").val(),
		'itemName':$(row).find(".comment_name").val(),
		'comment':$(row).find(".item_comment").val(),
		'price':anRawPrice,
		'categoryID':formCategorySelectValue,
		//'createdByUserID':selectedItem.createdByUser._id,
		//'createdByUserID':user.id,
		//'modifiedByUserID': user.id
	}
}

function showHideEditFormSpinner(el,showSpinner){
	if(!el){
		el = $('.container');
	}
	if(showSpinner){
		$(el).find(".pad_overlay").css("visibility", "visible");
	}else{
		$(el).find(".pad_overlay").css("visibility", "hidden");
	}
}


function showEditFormInputErrors(row, inputKey, errorMessage){
	
	var componentNameGroup = $(row).find("#component_name_group");
	if(inputKey === 'componentName'){
		$(componentNameGroup).addClass('has-error'); 
		$(componentNameGroup).append('<div class="help-block">' + errorMessage + '</div>'); // add the actual error message under our input
	}
	var commentNameGroup = $(row).find("#comment_name_group");
	if(inputKey === 'itemName'){
		$(commentNameGroup).addClass('has-error'); 
		$(commentNameGroup).append('<div class="help-block">' + errorMessage + '</div>'); // add the actual error message under our input
	}
	var itemCommentGroup = $(row).find("#item_comment_group");
	if(inputKey === 'comment'){
		$(itemCommentGroup).addClass('has-error'); 
		$(itemCommentGroup).append('<div class="help-block">' + errorMessage + '</div>'); // add the actual error message under our input
	}
	var itemPriceGroup = $(row).find('#item_price_group');
	if(inputKey === 'price'){
		$(itemPriceGroup).addClass('has-error'); 
		$(itemPriceGroup).append('<div class="help-block">' + errorMessage + '</div>');
	}
}

function formSubmitSaveAs(row, selectedItem){
		
	//*** Save new record based on existing selected record ***
	
	//Remove any error displays if there are some
	clearEditFormErrors(row);
	//get reference this edit form
	const form = $(row).find(".pad_form");
	//Set the data object we will send to server
	const formDataItem = setFormSubmitSaveAsObj(row, selectedItem);
	//Show a spinner
	showHideEditFormSpinner(row,true);

	async function submitSaveAs(){
		try{
			const item = await ajaxPostNewItem(formDataItem);
			let newItem = new Item(
				item.componentName,
				item.itemName,
				item.comment,
				item.price,
				item.originalFlag,
				item._id,
				item.categoryID,
				item.modifiedByUserID,
				item.createdByUserID,
				item.createdDateTime
			)
			items.push(newItem);

			//Close the edit form and then re-filter and display 
			closeEditFormDiv('', form);

		}
		catch(err){
			processAndDisplayError(err, row, form);
		}
	}

	submitSaveAs();

}

function processAndDisplayError(err, row, form){
	//Hide the spinner
	showHideEditFormSpinner(row,false);

	const errorType = err.responseJSON.errorType;
	const errorMessage = err.responseJSON.message;
	if(errorType === 'validation'){
		const inputKey = err.responseJSON.inputKey;
		showEditFormInputErrors(row, inputKey, errorMessage);
	}else{
		// TODO Finish this
		const tokenErrorMessage = checkTokenErrorType(errorType);
		if(tokenErrorMessage){
			// This is a token error. They must log in
			showFormError(form, 'Token issue. Please login');
			logout();
		}else{
			//This is some other issue
			console.error(err);
			showFormError(form, errorMessage);
		}

	}
}

function ajaxPostNewItem(formDataItem){

	return new Promise((resolve, reject) => {

		let token = '';
		if(user){
			token = user.token;
		}

		//=============================
		// $.ajax({url: `http://localhost:5000/zlookup-api/items`, 
		$.ajax({url: `${apiServer}/zlookup-api/items`, 
			type: "POST",
			headers: { 'x-auth-token': token },
			dataType: "json", 
			contentType:"application/json; charset=utf-8",
			data: JSON.stringify(formDataItem),

		})
		.done(function (respItem){

			resolve(respItem);

		})
		.fail(function(responseData, textStatus, error){
			reject(responseData);
	
		});

	})

}

function deleteItemByRecordID(id){
	
	//Find the item and remove from the array
	for (let i = 0; i < items.length; i++) {
		if(items[i].id == id){
			items.splice(i,1);
		}
	}
	
}

function ajaxDeleteItem(itemID){

	return new Promise((resolve, reject) => {
		// The global user object is not set when not logged in
		let token = '';
		if(user){
			token = user.token;
		}

		//=============================
		//$.ajax({url: `http://localhost:5000/zlookup-api/items/${itemID}`, 
		$.ajax({url: `${apiServer}/zlookup-api/items/${itemID}`,
			type: "DELETE",
			headers: { 'x-auth-token': token },
			dataType: "json", 
			contentType:"application/json; charset=utf-8"
			//data: JSON.stringify(formDataItem),

		})
		.done(function (){

			resolve();

		})
		.fail(function(responseData, textStatus, error){
			reject(responseData);

		});
	});

	
}

function deleteItem(row, selectedItem){
		
	//*** Delete ***

	const id = selectedItem.id;
	
	//Remove any error displays if there are some
	clearEditFormErrors(row);
	//get reference to this edit form
	var form = $(row).find(".pad_form");
	//Set the data object we will send to server
	//Show a spinner
	showHideEditFormSpinner(row,true);

	async function submitDeleteItem(){
		try{
			await ajaxDeleteItem(id);
			deleteItemByRecordID(id);
			//Close the edit form and then re-filter and display
			closeEditFormDiv('', form);
		}
		catch(err){
			processAndDisplayError(err, row, form);
		}
	}

	submitDeleteItem();

}

function ajaxItemUpdate(itemID, formDataItem){

	return new Promise((resolve, reject) => {

		// The global user object is not set when not logged in
		let token = '';
		if(user){
			token = user.token;
		}

		//=============================
		// $.ajax({url: `http://localhost:5000/zlookup-api/items/${itemID}`, 
		$.ajax({url: `${apiServer}/zlookup-api/items/${itemID}`,
			type: "PUT",
			headers: { 'x-auth-token': token },
			dataType: "json", 
			contentType:"application/json; charset=utf-8",
			data: JSON.stringify(formDataItem),

		})
		.done(function (respItem){

			resolve(respItem);

		})
		.fail(function(responseData, textStatus, error){
			reject(responseData);
	
		});

	})
}

function formSubmitUpdate(e, row, selectedItem){
	
	//*** UPDATE THE ITEM COMMENT ***
		
	//Remove any error displays if there are some
	clearEditFormErrors(row);
	//get reference this edit form
	const form = $(row).find(".pad_form");
	//Set the data object we will send to server
	const formDataItem = setFormDataObj(row, selectedItem);
	//Show a spinner
	showHideEditFormSpinner(row,true);
	
	async function submitFormSave(){
		try{
			const item = await ajaxItemUpdate(selectedItem.id, formDataItem);

			//Success
			selectedItem.componentName = item.componentName;
			selectedItem.name = item.itemName;
			selectedItem.comment = item.comment;
			selectedItem.price = item.price;
			selectedItem.category = item.categoryID;

			//Update the item display html 
			$(row).find(".component").html(htmlspecialchars(selectedItem.componentName));
			//$(row).find(".commentName").html(selectedItem.name);
			$(row).find(".commentName").html(htmlspecialchars(selectedItem.name));
			//$(row).find(".commentText").html(selectedItem.comment);
			$(row).find(".commentText").html(htmlspecialchars(selectedItem.comment));
			// TODO2 this next line should really produce properly formatted currency
			$(row).find(".money").html(selectedItem.price);
			
			//Close the edit form and then re-filter and display 
			closeEditFormDiv('', form);
		}
		catch(err){
			processAndDisplayError(err, row, form);
		}
	}
	submitFormSave();
}



function closeEditFormDiv(e, editFormDiv){
	
	//Toggle the chevron
	var resultRow = $(editFormDiv).closest('.result_row');
	var chevron = $(resultRow).find('.edit_icon');
	chevron.toggleClass('glyphicon-chevron-down').toggleClass('glyphicon-chevron-up');
	
	$(editFormDiv).slideUp("", function() { 
		$(this).remove(); 
		//Reload categories so the counts are updated
		//loadCategories();
		updateCategoryCounts();
		//Re-run the lookup 
		lookupFunction();
	} );

	
	
}

class Item{
	constructor(componentName, name, comment, price, originalFlag, id, category, modifiedByUser, createdByUser, createdDateTime){
		this.componentName = componentName;
		this.name = name;
		this.comment = comment;
		this.price = price;
		this.originalFlag = originalFlag;
		this.id = id;
		this.category = category; //This is an object
		this.modifiedByUser = modifiedByUser; //This is an object
		this.createdByUser = createdByUser;
		this.createdDateTime = createdDateTime;
	}
}

class View {

	static showView(displayFormID) {
		//Hide all views
		$('.view').each(
			function(){
				$(this).css("display", "none");
			}
		);

		//Show the wanted view
		$(displayFormID).css("display", "block");

	}
	static clearView(displayFormID){
		const formControls = $(displayFormID).find('.form-control');
		$(formControls).each(function(index){
			$(this).val('');
		});
		//Clear any errors
		$(displayFormID).find(".form-group").removeClass('has-error');
		$(displayFormID).find(".help-block").remove();
		$(displayFormID).find(".standard_err_message").css("display", "none");
	}
}

class User{
	constructor(firstName, lastName, id, email, token){
		this.firstName = firstName;
		this.lastName = lastName;
		this.id = id;
		this.email = email;
		this.token = token;
	}
	getFullName() {
		return this.firstName + ' ' + this.lastName;
	}

}

function showSignUpForm(){
	
	View.clearView('#sign_up_form');
	View.showView('#sign_up_form');
	
}

function showResetPasswordForm(){
	
	View.clearView('#reset_password_form');
	View.showView('#reset_password_form');
	
	
}

function showForgotPasswordForm(){
	
	View.clearView('#forgot_password_form');
	View.showView('#forgot_password_form');
	
}

function showCommentForm(){
	View.clearView('#comments_form');
	View.showView('#comments_form');
	loadCommentView();

}
function loadCommentView(){
	const elements = $('.comment_input').toArray();
	for(let i=0; i < elements.length; i++){
		const propertyName = $(elements[i]).attr('data-property-name');
		$(`#${elements[i].id}`).val(localStorage.getItem(propertyName));
	}
}

function numberLinesofText(text){
	let textLines = text.split('\n');
	//Make sure to trim each line
	//console.log(textLines);
	let formattedText = '';
	let lineNumber = 0;
	for(let i=0; i < textLines.length; i++){
		lineNumber++;
		formattedText = formattedText.concat(`${lineNumber}. ${textLines[i]}\n`);
	}
	formattedText.trim();
	return formattedText;

}

/* function clearSignUpForm(){
	
 	form = $('#sign_up_form');
	form.find('.first_name').val('');
	form.find('.last_name').val('');
	form.find('.your_email').val('');
	form.find('.password').val('');
	form.find('.confirm_password').val('');
} */

function showLoginForm(){
	
	View.clearView('#login_form');
	View.showView('#login_form');
	
}


/* function hideLoginForm(){
	
	$('#login_form').css("display", "none");
	
} */

function showSearchBlock(){
	//console.log('here here');
	//Check if logged in
	View.showView('#search_block');
}

function hideSearchBlock(){
	$("#lookup_error").css("display", "none");
	$("#lookup_error").html("");
	$("#search_block").css("display", "none");
	$('#lookupText').val("");
	
	//***Clean up any search stuff***
	//Clear lookup text
	$('#lookupText').val("");
	//Clean up any open edit forms
	$(".pad_form").remove();
	//Empty the result array
	resultItems = [];
	//Clear results in the result table
	$('#tbody').html('');
	//Clear the result count display
	$("#result_count").html("");

}

function ajaxSignup(firstName, lastName, email, password, confirmPassword){

	var formData = {
		'firstName':firstName,
		'lastName':lastName,
		'email':email,
		'password':password,
		'confirmPassword':confirmPassword
	}
	
	return new Promise((resolve, reject) => {
		$.ajax({url: `${apiServer}/zlookup-api/users`, 
		type: "POST",
		data: JSON.stringify(formData), 
		dataType: "json", 
		contentType:"application/json; charset=utf-8"
		})
		.done(function(responseData, status, xhr){
			//*** All is good ***
			resolve(responseData);
		})
		.fail(function(responseData, textStatus, error){
			reject(responseData);
		})
	});

}

function submitSignUpForm(){
	
	//*** SIGN UP SUBMIT FUNCTION ***
	
	var form = $('#sign_up_form');

	removeFormErrors(form);

	showHideEditFormSpinner(form, true);
	
	//Remove any errors if there are some
	$(form).find(".form-group").removeClass('has-error');
	$(form).find(".help-block").remove();
	
	var firstName = $(form).find(".first_name").val();
	var lastName = $(form).find(".last_name").val();
	var email = $(form).find(".your_email").val();
	var password = $(form).find(".password").val();
	var confirmPassword = $(form).find(".confirm_password").val();
	
	async function submitAjaxRequests(){
		try{
			const responseData = await ajaxSignup(firstName, lastName, email, password, confirmPassword);
			showLoginForm();
		}
		catch(err){
			const errorType = err.responseJSON.errorType;
			const errorMessage = err.responseJSON.message;
			if(errorType === 'validation'){
				const inputKey = err.responseJSON.inputKey;
				switch(inputKey){
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
						//Handle non form validation error here
						showFormError(form, errorMessage);
						break;
				}
	
			}else{
				// TODO Finish this
				showFormError(form, errorMessage);
			}
			return;
		}
		finally{
			showHideEditFormSpinner(form, false);
		}
		
	}
	
	submitAjaxRequests();
	
}

function ajaxLogin(email, password){

	let formData = {
		'email':email,
		'password':password
	}
	
	return new Promise((resolve, reject) => {
		// $.ajax({url: "http://localhost:5000/zlookup-api/auth", 
		$.ajax({url: `${apiServer}/zlookup-api/auth`, 
		type: "POST",
		data: JSON.stringify(formData), 
		dataType: "json", 
		contentType:"application/json; charset=utf-8"
		})
		.done(function(responseData, status, xhr){
			//*** All is good ***
			resolve(responseData);
		})
		.fail(function(responseData, textStatus, error){
			reject(responseData);
		})
	});

}

function removeFormErrors(form){

	//Remove any errors if there are some
	$(form).find(".form-group").removeClass('has-error');
	$(form).find(".help-block").remove();
	const errorMessageDiv = $(form).find(".standard_err_message");
	errorMessageDiv.css("display", "none");

}

function showFormError(form, errorMessage){
	//Show regular non-input error message
	const errorMessageDiv = $(form).find(".standard_err_message");
	errorMessageDiv.css("display", "block");
	errorMessageDiv.html(errorMessage);
}

function submitLoginForm(){
	
	const form = $('#login_form');
	
	removeFormErrors(form);

	showHideEditFormSpinner(form, true);
	
	const loginEmail = $(form).find(".login_email").val();
	const loginPassword = $(form).find(".login_password").val();
	
	//Async wrapper to submit login call to server
	async function submitAjaxRequests(){
		try{
			const responseData = await ajaxLogin(loginEmail, loginPassword);
			user = new User(responseData.firstName,responseData.lastName,responseData.id,responseData.email,responseData.token);

		}
		catch(err){
			const errorType = err.responseJSON.errorType;
			const errorMessage = err.responseJSON.message;
			if(errorType === 'validation'){
				const inputKey = err.responseJSON.inputKey;
				switch(inputKey){
					case 'email':
						const loginEmailGroup = $(form).find(".log_login_email");
						$(loginEmailGroup).addClass('has-error'); 
						$(loginEmailGroup).append('<div class="help-block">' + errorMessage + '</div>'); 
						break;
					case 'password':
						const loginPasswordGroup = $(form).find(".log_login_password");
						$(loginPasswordGroup).addClass('has-error'); // add the error class to show red input
						$(loginPasswordGroup).append('<div class="help-block">' + errorMessage + '</div>'); 
						break;
					default:
						//Handle non form validation error here
						showFormError(form, errorMessage);
						break;
				}
	
			}else{
				// TODO Finish this
				showFormError(form, errorMessage);
			}
			return;
		}
		finally{
			showHideEditFormSpinner(form, false);
		}

		//Show the search screen
		showSearchBlock();

		//Clear results in the result table
		var tableBody = document.getElementById("tbody");
		tableBody.innerHTML = '';

		//Load items, categories, etc
		try{
			await loadInitialData();
		}
		catch{
			showLoginForm();
		}

		loadCategories();
		lookupFunction();

		//Show logout menu button
		$('#logout_menu_item').css("display", "block");
		//Hide login menu button
		$('#login_menu_item').css("display", "none");
		//display user name id is user_info
		const displayName = "Hello " + user.getFullName();
		$('#user_info').html(displayName);
		
	}

	submitAjaxRequests();
	
}


function submitResetPasswordForm(){
	
	const form = $('#reset_password_form');
	
	//Remove any errors if there are some
	$(form).find(".form-group").removeClass('has-error');
	$(form).find(".help-block").remove();
	
	const newPassword = $(form).find(".enter_password_input").val();
	const confirmPassword = $(form).find(".reenter_password_input").val();
	
	const formData = {
		'newPassword':newPassword,
		'confirmPassword':confirmPassword
	}
	
	$.post('php/resetPassword.php',formData, function(responseData){
		
		if(!responseData.success){
			
			//Show any form errors
			
			const enter_password_group = $(form).find(".enter_password_group");
			if(responseData.errors.newPassword){
				$(enter_password_group).addClass('has-error'); 
				$(enter_password_group).append('<div class="help-block">' + responseData.errors.newPassword + '</div>'); 
			}
			const reenter_password_group = $(form).find(".reenter_password_group");
			if(responseData.errors.confirmPassword){
				$(reenter_password_group).addClass('has-error'); // add the error class to show red input
				$(reenter_password_group).append('<div class="help-block">' + responseData.errors.confirmPassword + '</div>'); 
			}
			
			if(responseData.errors.misc){
				//console.log(responseData.errors.misc);
				alert(responseData.errors.misc);
			}
		}else{
			
			// TODO finish this reset password stuff
/* 			//All is good
			showSearchBlock();
			//Load data
			loadDataFromServer();
			//Show logout menu button
			$('#logout_menu_item').css("display", "block");
			//Hide login menu button
			$('#login_menu_item').css("display", "none");
			//display user name id is user_info
			var displayName = "Hello " + responseData.user.firstName + " " + responseData.user.lastName;
			$('#user_info').html(displayName); */
		}
	},'json')
	.fail(function(responseData, textStatus, error){
	
		//Show the error information
		console.error("submitSignUpForm failed, status: " + textStatus + ", error: " + error);
		alert('submitSignUpForm failed. Check logs');

	})
	
}

function logout(){
	//Null out the user object
	user = null;
	//Clean up any open edit forms in the search block
	//Delete any data downloaded when logging in and / or loading data
	$(".pad_form").remove();
	//Empty the result array
	resultItems = [];
	//Empty the main items array
	items = [];
	//Empty the categories array and select list
	categories = [];
	$('#category_select').empty();
	//Remove the logout menu button
	$('#logout_menu_item').css("display", "none");
	//Show the login menu button
	$('#login_menu_item').css("display", "block");
	//remove the user info html at .user_info paragraph
	$('#user_info').html('');
	//Clear any text left in the lookup text
	$('#lookupText').val("");
	//Clear results in the result table
	$('#tbody').html('');
	//Clear the result count display
	$("#result_count").html("");
	//
	showLoginForm();
	
}

var htmlspecialchars = function(string) {
	//*** I got this function from a google search ***
	// Our finalized string will start out as a copy of the initial string.
	var escapedString = string;

	// For each of the special characters,
	var len = htmlspecialchars.specialchars.length;
	for (var x = 0; x < len; x++) {

	// Replace all instances of the special character with its entity.
	escapedString = escapedString.replace(
		new RegExp(htmlspecialchars.specialchars[x][0], 'g'),
		htmlspecialchars.specialchars[x][1]
	);
	}

	// Return the escaped string.
	return escapedString;
};

function clearLookupText(){
	//If already empty then don't do anything
	if(!$('#lookupText').val().length) return;
	//Clear out the text and run the lookup
	$('#lookupText').val('');
	lookupFunction();
}

// A collection of special characters and their entities.
htmlspecialchars.specialchars = [
	[ '&', '&amp;' ],
	[ '<', '&lt;' ],
	[ '>', '&gt;' ],
	[ '"', '&quot;' ]
];

var htmlspecialchars_decode = function(string) {
	//*** I got this function from a google search ***
	// Our finalized string will start out as a copy of the initial string.
	var unescapedString = string;

	// For each of the special characters,
	var len = htmlspecialchars_decode.specialchars.length;
	for (var x = 0; x < len; x++) {

	// Replace all instances of the entity with the special character.
	unescapedString = unescapedString.replace(
		new RegExp(htmlspecialchars_decode.specialchars[x][1], 'g'),
		htmlspecialchars_decode.specialchars[x][0]
	);
	}

	// Return the unescaped string.
	return unescapedString;
};

htmlspecialchars_decode.specialchars = [
	[ '"', '&quot;' ],
	[ '>', '&gt;' ],
	[ '<', '&lt;' ],
	[ '&', '&amp;' ]
];

$(document).ready(function(){
	
	//Make sure the edit form is hidden
	//$('#pad_form').hide();
	
	//$('.result_table').show();
	
	selectedItem = '';
	
	//Items array to hold all comment items
	items = [];
	//Categories array. IE. Electrical, Plumbing, Paint, etc. 
	categories = [];
	
	//Initialize a global selected paragraph var
	selectedParId = '';

	apiServer = 'https://zlookup-api.herokuapp.com';
	if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === ""){
		console.log('using local host');
		apiServer = 'http://localhost:5000'
	}else{
		console.log('Using Heroku');
	}
	
	//Initialize user to null because we don't have one yet
	//If we start using cookies or have a way to store the JWT 
	//then we will want to make an AJAX call to check if it's still valid
	user = null;
	// The global user object is not set when not logged in
	if(!user){
		showLoginForm();
	}

	//Attempt to load data. If not logged in it will show login instead
	$('#load_menu_item').on('click', function(e){

		(async function(){
			try{
				showHideEditFormSpinner(null, true);
				await loadInitialData();
				loadCategories();
				lookupFunction();
			}
			catch(err){
				showLoginForm();
			}
			finally{
				showHideEditFormSpinner(null, false);
			}
		})();
		
	})
	
	//Event handlers
	// $(window).on('focus', function(){
	// 	console.log('Focus Window');
	// }); 

	$('#all_checkbox').on('click', function(e){
		lookupFunction();
	});
	$('#lookupText').on('keyup', function(e){
		lookupFunction();
	});
	
	$('#category_select').change('keyup', function(e){
		lookupFunction();
	});

	$('#clear_button').on('click', function(e){
		clearLookupText();
	});

	

	$('#edit_menu_item').on('click', function(e){
		alert('Temporarily disabled');
		//editFunction();
	})

	$('#refresh_menu_item').on('click', function(e){
		reloadFunction();
	})
	//=========================
	$('#sign_up_menu_item').on('click', function(e){
		showSignUpForm();
	})
	$('#reset_password').on('click', function(e){
		showResetPasswordForm();
	})
	$('#forgot_password').on('click', function(e){
		showForgotPasswordForm();
	})
	$('#comments_menu_item').on('click', function(){
		showCommentForm();
	})
		
	
	$('#lookup_menu_item').on('click', function(e){
		showSearchBlock();
	})
	$('#login_menu_item').on('click', function(e){
		showLoginForm();
	})
	//========================
	$('#logout_menu_item').on('click', function(e){
		logout();
	})
	
	
	//
	$('#submit_button').on('click', function(){
		submitSignUpForm();
	});
	$('#login_submit_button').on('click', function(){
		submitLoginForm();
	});
	$('#login_here_link').on('click', function(){
		showLoginForm();
	});
	$('#reset_password_button').on('click', function(){
		submitResetPasswordForm();
	});

	$('#clear_comments_button').on('click', function(){
		localStorage.clear();
		loadCommentView();
	});

	$('#copy_comments_button').on('click', function(){
		//Loop all comments and add keys and values to an object
		let commentObj = {};
		const elements = $('.comment_input').toArray();
		for(let i=0; i < elements.length; i++){
			const propertyName = $(elements[i]).attr('data-property-name');
			let value = localStorage.getItem(propertyName);
			if(!value) value = '';
			//If this is a list type field then add numbers
			if($(elements[i]).hasClass( 'comment_input_list' ) && value){
				value = numberLinesofText(value);
			}
			commentObj[propertyName] = value; //Add property and value to the comment object

		}

		let formattedComment = '';
		if(commentObj.specLevel) formattedComment = formattedComment.concat(`[Spec Level: ${commentObj.specLevel}]`);
		if(commentObj.squareFeetListed) formattedComment = formattedComment.concat(` - [Sq ft: ${commentObj.squareFeetListed}/${commentObj.squareFeetMeasured}]`);
		if(commentObj.beds) formattedComment = formattedComment.concat(` - [Bed/bath: ${commentObj.beds}/${commentObj.baths}]`);
		if(commentObj.deltaT1) formattedComment = formattedComment.concat(` - [Temp split (1st floor): ${commentObj.deltaT1}]`);
		if(commentObj.deltaT2) formattedComment = formattedComment.concat(` - [Temp split (2nd floor): ${commentObj.deltaT2}]`);
		if(commentObj.deltaT3) formattedComment = formattedComment.concat(` - [Temp split (3rd floor): ${commentObj.deltaT3}]`);
		if(commentObj.woodWindows) formattedComment = formattedComment.concat(` - [Wood Windows Present?: ${commentObj.woodWindows}]`);
		if(commentObj.gas) formattedComment = formattedComment.concat(` - [Gas on/off: ${commentObj.gas}]`);
		if(commentObj.heatTested) formattedComment = formattedComment.concat(` - [Heat Tested?: ${commentObj.heatTested}]`);
		if(commentObj.coolTested) formattedComment = formattedComment.concat(` - [Cool Tested?: ${commentObj.coolTested}]`);
		if(commentObj.appliancesTaken) formattedComment = formattedComment.concat(` - [Appliances Being Taken: ${commentObj.appliancesTaken}]`);
		if(commentObj.garageRemotes) formattedComment = formattedComment.concat(` - [Garage Remotes: ${commentObj.garageRemotes}]`);
		if(commentObj.inAttendance) formattedComment = formattedComment.concat(` - [In Attendance: ${commentObj.inAttendance}]`);
		if(commentObj.externalities) formattedComment = formattedComment.concat(` - [Noted externalities: ${commentObj.externalities}]`);
		if(commentObj.notes) formattedComment = formattedComment.concat(` - [Add Notes: ${commentObj.notes}]`);

		updateClipboard(formattedComment);
	});

	$('.comment_input').on('keyup', function(e){
		const el = $(e.target);
		const propertyName = el.attr('data-property-name');
		const value = $.trim($(el).val());
		localStorage.setItem(propertyName,value);
	});


	
});

