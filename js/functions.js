class Filter {
  constructor() {
    this.categoryID = "";
    this.subCategoryString = "";
    this.defectString = "";
    this.lookupText = "";

    this.allItems = [];
    this.categoryItems = [];
    this.subCategoryItems = [];
    this.defectItems = [];
    this.keywordItems = [];
  }
  runFilter(fullRefresh) {
    const categoryID = getCategoryID();
    const lookupText = getLookupText();
    const subCategoryString = getSubCategoryValue();
    const defectString = getDefectValue();

    if (categoryID !== this.categoryID || fullRefresh) {
      let subCategories = [];
      //Clear out the defects select
      let defects = [];
      $("#defect_select").val("");
      loadDefectSelect(defects);
      this.defectString = "";

      //Loop allItems and filter by the selected categoryID
      this.filterCategoryItems(categoryID); // = this.categoryItems
      //Store this latest category ID
      this.categoryID = categoryID;

      //Build array of sub categories (ie. Toilet) based on the filtered list
      subCategories = buildSubComponentsArray(this.categoryItems);

      //Loop categoryItems and build a filtered list of items
      //based on the first sub category (ie. Toilet)
      // this.filterSubCategoryItems(subCategories[0], defects[0]); // = this.subCategoryItems
      this.filterSubCategoryItemsNew(subCategories[0]);
      this.defectItems = [...this.subCategoryItems];
      //Store this latest sub category (ie. Toilet)
      this.subCategoryString = subCategories[0];
      //this.defectString = defects[0];

      //Load the sub categories select list with values (ie Toilet)
      loadSubComponentSelect(subCategories);

      //Filter by keywords
      this.filterByKeywords(this.subCategoryItems, lookupText); // = this.keywordItems
      this.lookupText = lookupText;

      return this.keywordItems;
    }
    if (subCategoryString !== this.subCategoryString) {
      //Filter based on the new sub category string
      //this.filterSubCategoryItems(subCategoryString, defectString);
      this.filterSubCategoryItemsNew(subCategoryString);
      //Store the new sub category
      this.subCategoryString = subCategoryString;
      //this.defectString = defectString;

      $("#defect_select").val("");
      let defects = [];
      //console.log(this.subCategoryItems);
      defects = buildDefectsArray(this.subCategoryItems);
      //console.log(defects);
      loadDefectSelect(defects);
      this.defectString = "";

      this.defectItems = [...this.subCategoryItems];

      this.filterByKeywords(this.defectItems, lookupText);
      this.lookupText = lookupText;

      return this.keywordItems;
    }
    if (defectString !== this.defectString) {
      this.filterDefects(defectString);
      this.defectString = defectString;
      this.filterByKeywords(this.defectItems, lookupText);
      this.lookupText = lookupText;

      return this.keywordItems;
    }
    if (lookupText !== this.lookupText) {
      //this.filterByKeywords(this.subCategoryItems, lookupText);
      this.filterByKeywords(this.defectItems, lookupText);
      this.lookupText = lookupText;

      return this.keywordItems;
    }
    //Nothing changed
    return this.keywordItems;
  }
  clearAll() {
    this.categoryID = "";
    this.subCategoryString = "";
    this.defectString = "";
    this.lookupText = "";

    this.allItems = [];
    this.categoryItems = [];
    this.subCategoryItems = [];
    this.keywordItems = [];
    this.defectItems = [];
  }
  filterCategoryItems(categoryID) {
    this.categoryItems = this.allItems.filter((item) => {
      if (categoryID !== item.category._id) {
        return false;
      } else {
        return true;
      }
    });
  }
  filterSubCategoryItems(subCategoryName, defectString) {
    this.subCategoryItems = this.categoryItems.filter((item) => {
      //If query words empty or undefined then no filter
      if (!subCategoryName && !defectString) {
        return true;
      }

      if (defectString === item.defect && !subCategoryName) {
        return true;
      }

      if (subCategoryName === item.subComponentName && !defectString) {
        return true;
      }

      if (
        subCategoryName !== item.subComponentName ||
        defectString !== item.defect
      ) {
        return false;
      }

      return true;
    });
  }

  filterSubCategoryItemsNew(subCategoryName) {
    this.subCategoryItems = this.categoryItems.filter((item) => {
      //If query words empty or undefined then no filter
      if (!subCategoryName) {
        return true;
      }

      if (subCategoryName !== item.subComponentName) {
        return false;
      }

      return true;
    });
  }

  filterDefects(defectName) {
    this.defectItems = this.subCategoryItems.filter((item) => {
      // let defectsCommaArray = [];
      //If query words empty or undefined then no filter
      if (!defectName) {
        return true;
      }

      // if (defectName !== item.defect) {
      //   return false;
      // }
      if (item.defect.indexOf(defectName) === -1) {
        return false;
      }
      // defectsCommaArray = item.defect.split(",");
      // defectsCommaArray.forEach((defect) => {
      //   if (defects.indexOf(defect) === -1) {
      //     defects.push(defect);
      //   }
      // });

      return true;
    });
  }

  filterByKeywords(itemsToSort, lookupText) {
    if (lookupText == "") {
      this.keywordItems = itemsToSort;
      return;
    }
    const lookupWords = lookupText.split(" ");

    let newArray = itemsToSort.filter((item) => {
      const comment = item.comment;
      const name = item.name;
      let found;
      for (let icount = 0; icount < lookupWords.length; icount++) {
        let combined = name + " " + comment;
        var n = combined
          .toLowerCase()
          .indexOf(lookupWords[icount].toLowerCase());
        if (n == -1) {
          //Not found (remove the element)
          found = false;
        } else {
          //Found so keep the element
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      } else {
        return true;
      }
    });
    this.keywordItems = newArray;
  }
}

var myFilter = (function () {
  let filterUtility = new Filter();
  return function () {
    return filterUtility;
  };
})();

function commentClick2(par, text) {
  //If something already selected then unselect it
  if (selectedParId) {
    $("#" + selectedParId).css("background-color", "");
  }
  //Set the background color of the selected paragraph element
  let id = $(par).attr("id");
  $("#" + id).css("background-color", "yellow");
  //Remember the selected id
  selectedParId = id;

  //Copy the p element clicked on to the clipboard
  const el = document.createElement("textarea");
  //el.value = par.innerHTML;
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  //el.setSelectionRange(0, 99999); //It doesn't look like I need this
  document.execCommand("copy");
  document.body.removeChild(el);
}

function updateClipboard(text) {
  const el = document.createElement("textarea");
  //el.value = par.innerHTML;
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  //el.setSelectionRange(0, 99999); //It doesn't look like I need this
  document.execCommand("copy");
  document.body.removeChild(el);
}

function reloadFunction() {
  //Completely refresh page from server
  location.reload(true);
}

function ajaxItems() {
  return new Promise((resolve, reject) => {
    // The global user object is not set when not logged in
    let token = "";
    if (user) {
      token = user.token;
    }

    //Call async function here
    let respItems = [];

    //=============================
    //$.ajax({url: "http://localhost:5000/zlookup-api/items",
    $.ajax({
      url: `${apiServer}/zlookup-api/items`,
      type: "GET",
      //This below was messing with CORS (Cross Origin Resource Sharing) somehow
      // xhrFields: {
      // 	withCredentials: true
      //  },
      headers: { "x-auth-token": token },
      dataType: "json",
      contentType: "application/json; charset=utf-8",
    })
      .done(function (responseItems, status, xhr) {
        //Loop each comment item returned
        $(responseItems).each(function () {
          //Get the created by user name
          // var createdByUserName = this.firstName + " " + this.lastName;
          let item = new Item(
            this.componentName,
            this.subComponentName,
            this.defect,
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
      .fail(function (responseData, textStatus, error) {
        reject(responseData);
      });
  });
}

function loadInitialData() {
  //*** Load data from server ***

  const filterUtility = myFilter();
  filterUtility.clearAll(); //Clears main item array and filter arrays

  //Initialize these global arrays
  categories = [];
  selectedParId = "";

  return new Promise((resolve, reject) => {
    async function submitAjaxRequests() {
      try {
        //Load all items and category arrays
        filterUtility.allItems = await ajaxItems();
        categories = await ajaxCategories();
        resolve();
      } catch (err) {
        const errorType = err.responseJSON.errorType;
        const tokenErrorMessage = checkTokenErrorType(errorType);
        if (tokenErrorMessage) {
          console.error(tokenErrorMessage);
        } else {
          console.error(err);
        }
        reject();
      }
    }

    submitAjaxRequests();
  });
}

function checkTokenErrorType(errorType) {
  if (errorType === "undefined" || null) {
    return null;
  }

  if (errorType === "token_missing") {
    return { message: "Token missing" };
  } else if (errorType === "token_invalid") {
    return { message: "Token invalid" };
  } else if (errorType === "token_expired") {
    return { message: "Token expired" };
  } else {
    return null;
    //throw new Error('Problem checking error type');
  }
}

function ajaxCategories() {
  return new Promise((resolve, reject) => {
    let token = "";
    if (user) {
      token = user.token;
    }

    //Make web call to get all initial data

    // $.ajax({url: "http://localhost:5000/zlookup-api/categories",
    $.ajax({
      url: `${apiServer}/zlookup-api/categories`,
      type: "GET",
      headers: { "x-auth-token": token },
      dataType: "json",
      contentType: "application/json; charset=utf-8",
    })
      .done(function (responseCategories, status, xhr) {
        resolve(responseCategories);
      })
      .fail(function (responseData, textStatus, error) {
        reject(responseData);
      });
  });
}

function loadSubCategories() {}

function loadCategories() {
  let option = "";
  $("#category_select").empty();
  for (let i = 0; i < categories.length; i++) {
    // let itemCount = getItemCountPerCategory(categories[i]);
    // option += `<option value="${categories[i]._id}">${categories[i].name} - ${itemCount}</option>`;
    option += `<option value="${categories[i]._id}">${categories[i].name}</option>`;
  }
  $("#category_select").append(option);
}

function updateCategoryCounts() {
  $("#category_select > option").each(function () {
    let category = getCategoryByID(this.value);
    //let itemCount = getItemCountPerCategory(category);
    //this.text = `${category.name} - ${itemCount}`;
    this.text = category.name;
  });
}

function getCategoryByID(id) {
  return categories.find((category) => category._id === id);
}

function getItemCountPerCategory(category) {
  let count = 0;
  const filterUtility = myFilter();
  const allItems = filterUtility.allItems;
  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].category._id === category._id) count++;
  }
  return count;
}

function loadFormCategories(categoryID) {
  let option = "";
  let currentSelectionID = 0;
  for (let i = 0; i < categories.length; i++) {
    option +=
      '<option value="' +
      categories[i]._id +
      '">' +
      categories[i].name +
      "</option>";
    if (categoryID == categories[i]._id) {
      currentSelectionID = categoryID;
    }
  }
  $(".form_category_select").append(option);
  //Set the category drop down selected item
  $(".form_category_select").val(currentSelectionID);
}

function notReadyFunction() {
  alert("Sorry! This doesn't do anything yet.");
}

function categoryLookup() {
  const originalCategory = $("#category_select").val();
  const lookupText = $("#category_lookup").val().toLowerCase();
  const cat = categories.find((category) => {
    let n = category.name.toLowerCase().indexOf(lookupText);
    if (n > -1) return true;
  });
  if (cat) {
    $("#category_select").val(cat._id);
    //lookupFunction();
  } else {
    $("#category_select").val("");
  }
  //Only do a lookup if the category has changed
  if (originalCategory !== $("#category_select").val()) {
    $("#category_select").trigger("change");
  }
}

function updateStaticHeader() {
  let susanName = localStorage.getItem("susanName");
  susanName = susanName ? susanName : "";
  let zatName = localStorage.getItem("zatName");
  zatName = zatName ? zatName : "";
  let propertyAddress = localStorage.getItem("propertyAddress");
  propertyAddress = propertyAddress ? propertyAddress : "";
  let yearBuilt = localStorage.getItem("yearBuilt");
  yearBuilt = yearBuilt ? yearBuilt : "";
  let bedsListed = localStorage.getItem("bedsListed");
  bedsListed = bedsListed ? bedsListed : "";
  let fullBathsListed = localStorage.getItem("fullBathsListed");
  fullBathsListed = fullBathsListed ? fullBathsListed : "";
  let halfBathsListed = localStorage.getItem("halfBathsListed");
  halfBathsListed = halfBathsListed ? halfBathsListed : "";
  $(".susan_name_input_info").html(susanName);
  $(".zat_name_input_info").html(zatName);
  $(".property_address_info").html(propertyAddress);
  $(".year_built_info").html(yearBuilt);
  $(".beds_input_info").html(bedsListed);
  $(".baths_input_info").html(fullBathsListed);
  $(".baths_input2_info").html(halfBathsListed);
}

function isAddToListTypeComment(item) {
  if (item.category.addToLocation) {
    return true;
  } else {
    return false;
  }
}

function addToListOnClick(item) {
  const { comment } = item;
  //Get array of curly brace matches (see if there are curly braces)
  if (!getPlaceHolders(comment)) {
    //No placeholders so just add to the list
    updateLocalStorage(item.category, comment);
    showMyAlert("Item added successfully!", "success");
  } else {
    showEditItemModal(item);
  }
}

function showMyAlert(message, alertType) {
  const myalert = $("#myalert");
  $(myalert).removeClass("alert-success");
  $(myalert).removeClass("alert-info");
  $(myalert).removeClass("alert-warning");
  $(myalert).removeClass("alert-danger");
  switch (alertType) {
    case "success":
      $(myalert).addClass("alert-success");
      break;
    case "info":
      $(myalert).addClass("alert-info");
      break;
    case "warning":
      $(myalert).addClass("alert-warning");
      break;
    case "danger":
      $(myalert).addClass("alert-danger");
      break;
    default:
      break;
  }
  $("#my_alert_message").html(message);
  $(myalert).slideDown("fast", () => {
    setTimeout(() => {
      $(myalert).slideUp("fast");
    }, 500);
  });
}

function updateLocalStorage(category, newText) {
  if (category.addToLocation === "externalities") {
    let externalitiesValue = localStorage.getItem("externalities");
    if (!externalitiesValue) {
      localStorage.setItem("externalities", newText);
    } else {
      externalitiesValue = externalitiesValue.concat("\n" + newText);
      localStorage.setItem("externalities", externalitiesValue);
    }
  } else if (category.addToLocation === "notes") {
    let externalitiesValue = localStorage.getItem("notes");
    if (!externalitiesValue) {
      localStorage.setItem("notes", newText);
    } else {
      externalitiesValue = externalitiesValue.concat("\n" + newText);
      localStorage.setItem("notes", externalitiesValue);
    }
  }
}

function showEditItemModal(item) {
  // Remove the curly braces on placeholder words and show modal window
  // with this comment in the body
  $("#modal_text_input").val(stripPlaceHolderBraces(item.comment));
  // Store this object in hidden div on form
  $("#item_object_stringify").html(JSON.stringify(item));
  //Only show the appropriate buttons for this type of item
  if (isAddToListTypeComment(item)) {
    $("#add_to_list_button").css("display", "inline");
  } else {
    $("#add_to_list_button").css("display", "none");
  }
  $("#myModal").modal();
}

function getPlaceHolders(text) {
  //Returns array of curly brace words
  return text.match(/[^{]+(?=\})/g);
}
function stripPlaceHolderBraces(text) {
  return text.replace(/{|}/gi, "");
}

function buildSubComponentsArray(itemsArray) {
  //Build an array of sub component names from the array list passed in
  let subComponents = [];
  let hasBlank = false;
  for (let i = 0; i < itemsArray.length; i++) {
    if (!itemsArray[i].subComponentName) hasBlank = true; //This is to keep out the blank
    if (subComponents.indexOf(itemsArray[i].subComponentName) === -1) {
      subComponents.push(itemsArray[i].subComponentName);
    }
  }
  if (!hasBlank) subComponents.push("");
  subComponents.sort();
  return subComponents;
}

function buildDefectsArray(itemsArray) {
  let defects = [];
  let hasBlank = false;
  let defectsCommaArray = [];
  for (let i = 0; i < itemsArray.length; i++) {
    if (!itemsArray[i].defect) hasBlank = true; //This is to keep out the blank
    //If defect already added don't add it again
    defectsCommaArray = itemsArray[i].defect.split(",");
    defectsCommaArray.forEach((defect) => {
      if (defects.indexOf(defect) === -1) {
        defects.push(defect);
      }
    });
    // if (defects.indexOf(itemsArray[i].defect) === -1) {
    //   defects.push(itemsArray[i].defect);
    // }
  }
  if (!hasBlank) defects.push("");
  defects.sort();
  return defects;
}

function loadSubComponentSelect(subComponents) {
  let option = "";
  $("#sub_category_select").empty();
  for (let i = 0; i < subComponents.length; i++) {
    option += `<option value="${subComponents[i]}">${subComponents[i]}</option>`;
  }
  $("#sub_category_select").append(option);
}

function loadDefectSelect(subComponents) {
  let option = "";
  $("#defect_select").empty();
  for (let i = 0; i < subComponents.length; i++) {
    option += `<option value="${subComponents[i]}">${subComponents[i]}</option>`;
  }
  $("#defect_select").append(option);
}

function lookupStart() {
  //If there are no items in the master all items array then show a message
  //Otherwise clear any message
  const filterUtility = myFilter();
  const allItems = filterUtility.allItems;

  if (!Array.isArray(allItems) || !allItems.length) {
    // array does not exist, is not an array, or is empty
    $("#lookup_error").css("display", "block");
    $("#lookup_error").html("No items. You probably need to login?");
  } else {
    $("#lookup_error").css("display", "none");
    $("#lookup_error").html("");
  }
  //Clean up any open edit forms
  $(".pad_form").remove();
  //Clear results in the result table
  $("#tbody").html("");
  //Clear the result count display
  $("#result_count").html("");
}

function loadResultsTable(resultItems) {
  // *** LOAD THE TABLE ***

  const lookupWords = getLookupWords();

  //Clear results in the result table
  var tableBody = document.getElementById("tbody");

  //tableBody.innerHTML = '';

  //Clear the selected paragraph
  selectedParId = "";

  var rowCount = 0;

  //Set the count span element
  $("#result_count").html(resultItems.length);

  for (i = 0; i < resultItems.length; i++) {
    const resultItem = resultItems[i];
    const { componentName, name, price, comment } = resultItem;

    rowCount = rowCount + 1;

    var row = tableBody.insertRow();
    var rowId = "R" + i;
    row.setAttribute("id", rowId);
    row.setAttribute("class", "result_row");

    //Insert cell
    var cell0 = row.insertCell(0);
    var span = $(
      "<span class='glyphicon glyphicon-chevron-down edit_icon'></span>"
    );
    //$(editIcon).html(span);
    //$(cell0).append(editIcon);
    $(cell0).append(span);
    //$(cell0).append(plus);

    //Event handler for pencil click
    $(span).on(
      "click",
      (function (span) {
        return function () {
          showEditForm2(span);
        };
      })(span)
    );

    //Insert comment cell
    var cell1 = row.insertCell(1);
    $(cell1).attr("class", "cell1");

    //*** Component Name *** ie. Exterior, Bedroom, Kitchen, etc
    var parComponentName = document.createElement("p");
    parComponentName.setAttribute("class", "name component");
    //Convert to html entities so the browser doesn't process any html type chars
    var parComponentNameText = htmlspecialchars(componentName);
    parComponentName.innerHTML = parComponentNameText;
    cell1.appendChild(parComponentName);

    //*** Heading Text AKA Comment Name ***
    var headId = "H" + i;
    var parHeading = document.createElement("p");
    parHeading.setAttribute("class", "name touch commentName");
    parHeading.setAttribute("id", headId);
    //Convert to html entities so the browser doesn't process any html type chars
    var parHeadingText = htmlspecialchars(name);
    //Highlight
    parHeading.innerHTML = highlight(parHeadingText, lookupWords);
    //parHeading.innerHTML = parHeadingText;
    cell1.appendChild(parHeading);

    //*** Comment Text ***
    var textId = "T" + i;
    var par = document.createElement("p");
    par.setAttribute("class", "touch commentText");
    par.setAttribute("id", textId);
    //Convert to html entities so the browser doesn't process any html type chars
    var parCommentText = htmlspecialchars(comment);
    //Highlight the search words in the par element
    par.innerHTML = highlight(parCommentText, lookupWords);
    cell1.appendChild(par);

    //*** Add price ***
    let priceEl = $(cell1).append(
      '<p class="price_display">Price: ' + price + "</p>"
    );

    //Set event handler for heading to copy data to clipboard
    parHeading.onclick = (function (parHeading, name) {
      return function () {
        //Copy to clipboard
        commentClick2(parHeading, name);
      };
    })(parHeading, name);

    //var commentText = resultItem.comment;
    par.onclick = (function (par, comment) {
      return function () {
        //Get array of curly brace matches (see if there are curly braces)
        if (!getPlaceHolders(comment)) {
          //Highlight text and copy to clipboard
          commentClick2(par, comment);
        } else {
          //Show modal edit item window
          showEditItemModal(resultItem);
        }
      };
    })(par, comment);

    //Add an Add to List button if this is that type of comment
    if (isAddToListTypeComment(resultItem)) {
      //Add the Add to List button
      let plus = $(
        '<button type="button" class="btn btn-success btn-sm" id="add_comment_button">Add to List</button>'
      );
      $(cell1).append(plus);
      $(plus).on(
        "click",
        (function (resultItem) {
          return function () {
            addToListOnClick(resultItem);
          };
        })(resultItem)
      );
    }
  }
}

// function loadSubComponentsForSearch(subComponents, item){
// 	if(subComponents.indexOf(item.subComponentName) === -1){
// 		subComponents.push(item.subComponentName);
// 	}
// }

function highlight(textToProcess, lookupWordsArray) {
  //Highlight the search words in the par element
  var icount;
  var newText = textToProcess;
  for (icount = 0; icount < lookupWordsArray.length; icount++) {
    //I found this online to replace everything
    //outside html tags only so it doesn't keep clobbering itself
    var searchstring = lookupWordsArray[icount].replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );
    var regex = new RegExp("(" + searchstring + ")(?!([^<]+)?>)", "gi");
    newText = newText.replace(regex, '<span class="highlight">$&</span>');
  }
  return newText;
}

function showEditForm2(spanElement) {
  //Get this checkboxes parent table row
  var row = $(spanElement).closest(".result_row");

  //Get cell1 (has comment, name, etc.
  var cell1 = $(row).find(".cell1");

  //Get the form div
  var editFormDiv = $(row).find(".pad_form");

  //If the edit form already exists in the cell then close it and return
  if ($(row).find(".pad_form").length) {
    closeEditFormDiv("", editFormDiv);

    return;
  }

  //Only allow one open at a time. I had to do this because of problems with AutoNumeric
  if ($(".pad_form").length) return;

  //Toggle the chevron
  var chevron = $(row).find(".edit_icon");
  chevron
    .toggleClass("glyphicon-chevron-down")
    .toggleClass("glyphicon-chevron-up");

  //Get the id of the row
  var rowIdStr = $(row).attr("id");

  //Get the number only from the id
  var str = rowIdStr.replace(/[^\d.]/g, "");
  var resultItemIndex = parseInt(str);
  //The current Item
  const filterUtility = myFilter();
  // var selectedItem2 = filterUtility.subCategoryItems[resultItemIndex];
  var selectedItem2 = filterUtility.keywordItems[resultItemIndex];

  // TODO2 - Add an additional comment option to the form

  //Create the edit form div and start out not displayed
  var editFormDiv = $(
    '<div style="display: none;" class="pad_form">' +
      '<form class="edit_form" action="..blah" method="post">' +
      '<select class="form_category_select"></select>' +
      '<div id="component_name_group" class="form-group">' +
      '<label for="component_name" class="renowalk_component">RenoWalk Component:</label>' +
      '<input type="text" class="form-control component_name" id="component_name">' +
      "</div>" +
      '<div id="comment_name_group" class="form-group">' +
      '<label for="comment_name" class="renowalk_comment_label">RenoWalk Comment Name:</label>' +
      '<input type="text" class="form-control comment_name" id="comment_name">' +
      "</div>" +
      '<div id="item_comment_group" class="form-group">' +
      '<label for="item_comment">Comment:</label>' +
      '<textarea class="form-control rounded-0 item_comment" id="item_comment" rows="4"></textarea>' +
      "</div>" +
      '<div id="sub_component_group" class="form-group">' +
      '<label for="sub_component_input">Sub-Component:</label>' +
      '<input type="text" class="form-control sub_component_input" id="sub_component_input">' +
      "</div>" +
      '<div id="defects_group" class="form-group">' +
      '<label for="defect_input">Defect:</label>' +
      '<input type="text" class="form-control defect_input" id="defect_input">' +
      "</div>" +
      '<div id="item_price_group" class="form-group">' +
      '<label for="item_price">Price:</label>' +
      '<input type="tel" class="form-control item_price" id="item_price">' +
      "</div>" +
      '<div class="row">' +
      '<div class="col-sm-6"><span class="database_id_label">Record ID: </span><span class="database_id"></span></div>' +
      '<div class="col-sm-6 text-right created_by"></div>' +
      "</div>" +
      '<button type="button" class="btn btn-success btn-sm save_button">Save</button>' +
      '<button type="button" class="btn btn-success btn-sm save_new_button">Save As</button>' +
      '<button type="button" class="btn btn-danger btn-sm delete_button">Delete</button>' +
      '<button type="button" class="btn btn-warning pull-right btn-sm cancel_button">Cancel</button>' +
      '<div class="bg-danger text-danger panel-body standard_err_message"></div>' +
      "</form>" +
      //Intitially hidden overlay for spinner
      '<div class="pad_overlay">' +
      '<div class="loader" >' +
      "</div>" +
      "</div>" +
      "</div>"
  );

  $(editFormDiv).appendTo($(cell1)).slideDown();

  //I could not get this AutoNumeric stuff to work with multiple dynamically loaded forms so I only allow one at a time above
  const autoNumericOptions = {
    allowDecimalPadding: "floats",
    decimalCharacter: ".",
    digitGroupSeparator: ",",
    emptyInputBehavior: "zero",
    watchExternalChanges: true,
  };
  //anItemPrice = new AutoNumeric.multiple('.item_price',AutoNumeric.getPredefinedOptions().NorthAmerican);
  anItemPrice = new AutoNumeric.multiple(".item_price", autoNumericOptions);

  //Load the categories from the global categories array
  loadFormCategories(selectedItem2.category._id);

  //Fill in the form
  var componentName = $(editFormDiv).find(".component_name");
  componentName.val(selectedItem2.componentName);

  const subComponentName = $(editFormDiv).find(".sub_component_input");
  subComponentName.val(selectedItem2.subComponentName);

  const defect = $(editFormDiv).find(".defect_input");
  defect.val(selectedItem2.defect);

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
  $(saveButton).on("click", function (e) {
    formSubmitUpdate(e, row, selectedItem2);
  });

  //Register the save new button click event
  var saveNewButton = $(editFormDiv).find(".save_new_button");
  $(saveNewButton).on("click", function () {
    formSubmitSaveAs(row, selectedItem2);
  });

  //Register the delete button click event
  var deleteButton = $(editFormDiv).find(".delete_button");
  $(deleteButton).on("click", function () {
    deleteItem(row, selectedItem2);
  });

  const fullName =
    selectedItem2.createdByUser.firstName +
    " " +
    selectedItem2.createdByUser.lastName;
  $(editFormDiv)
    .find(".created_by")
    .html("Created By: " + htmlspecialchars(fullName));

  var cancelButton = $(row).find(".cancel_button");
  $(cancelButton).on("click", function (e) {
    closeEditFormDiv(e, editFormDiv);
  });
}

function clearElementErrors(parentEl) {
  //Remove any errors if there are some
  $(parentEl).find(".form-group").removeClass("has-error");
  $(parentEl).find(".help-block").remove();
}

function setFormDataObj(row, selectedItem) {
  //Use AutoNumeric to get raw price number
  let anRawPrice = AutoNumeric.getAutoNumericElement(
    ".item_price"
  ).getNumericString();
  anRawPrice = parseFloat(anRawPrice);

  //The categoryID is stored in the value of the category Select element
  const formCategorySelectValue = $(row).find(".form_category_select").val();

  // //Create array from comma delimited defects
  // const defects = $(row).find(".defect_input").val();
  // const defectsArray = defects.split(',').map((item) => {
  // 	return item.trim();
  // });

  //Set the formData object to send to server
  const obj = {
    componentName: $(row).find(".component_name").val(),
    subComponentName: $(row).find(".sub_component_input").val().trim(),
    defect: $(row).find(".defect_input").val().trim(),
    itemName: $(row).find(".comment_name").val(),
    comment: $(row).find(".item_comment").val(),
    price: anRawPrice,
    categoryID: formCategorySelectValue,
  };
  return obj;
}

function setFormSubmitSaveAsObj(row, selectedItem) {
  //Use AutoNumeric to get raw price number
  let anRawPrice = AutoNumeric.getAutoNumericElement(
    ".item_price"
  ).getNumericString();
  anRawPrice = parseFloat(anRawPrice);

  //Set the formData object to send to server
  return {
    componentName: $(row).find(".component_name").val(),
    subComponentName: $(row).find(".sub_component_input").val().trim(),
    defect: $(row).find(".defect_input").val().trim(),
    itemName: $(row).find(".comment_name").val(),
    comment: $(row).find(".item_comment").val(),
    price: anRawPrice,
    categoryID: $(row).find(".form_category_select").val(),
    //'createdByUserID':selectedItem.createdByUser._id,
    //'createdByUserID':user.id,
    //'modifiedByUserID': user.id
  };
}

function showHideEditFormSpinner(el, showSpinner) {
  if (!el) {
    el = $(".container");
  }
  if (showSpinner) {
    $(el).find(".pad_overlay").css("visibility", "visible");
  } else {
    $(el).find(".pad_overlay").css("visibility", "hidden");
  }
}

function showEditFormInputErrors(row, inputKey, errorMessage) {
  const componentNameGroup = $(row).find("#component_name_group");
  const commentNameGroup = $(row).find("#comment_name_group");
  const itemCommentGroup = $(row).find("#item_comment_group");
  const itemPriceGroup = $(row).find("#item_price_group");
  const subComponentGroup = $(row).find("#sub_component_group");
  //sub_component_input

  if (inputKey === "componentName") {
    $(componentNameGroup).addClass("has-error");
    $(componentNameGroup).append(
      '<div class="help-block">' + errorMessage + "</div>"
    ); // add the actual error message under our input
  }
  if (inputKey === "itemName") {
    $(commentNameGroup).addClass("has-error");
    $(commentNameGroup).append(
      '<div class="help-block">' + errorMessage + "</div>"
    ); // add the actual error message under our input
  }
  if (inputKey === "comment") {
    $(itemCommentGroup).addClass("has-error");
    $(itemCommentGroup).append(
      '<div class="help-block">' + errorMessage + "</div>"
    ); // add the actual error message under our input
  }
  // if (inputKey === 'comment') {
  // 	$(itemCommentGroup).addClass('has-error');
  // 	$(itemCommentGroup).append('<div class="help-block">' + errorMessage + '</div>'); // add the actual error message under our input
  // }
  if (inputKey === "subComponentName") {
    $(subComponentGroup).addClass("has-error");
    $(subComponentGroup).append(
      '<div class="help-block">' + errorMessage + "</div>"
    ); // add the actual error message under our input
  }
  if (inputKey === "price") {
    $(itemPriceGroup).addClass("has-error");
    $(itemPriceGroup).append(
      '<div class="help-block">' + errorMessage + "</div>"
    );
  }
}

function formSubmitSaveAs(row, selectedItem) {
  //*** Save new record based on existing selected record ***
  const filterUtility = myFilter();
  const allItems = filterUtility.allItems;
  //Remove any error displays if there are some
  clearElementErrors(row);
  //get reference this edit form
  const form = $(row).find(".pad_form");
  //Set the data object we will send to server
  const formDataItem = setFormSubmitSaveAsObj(row, selectedItem);
  //Show a spinner
  showHideEditFormSpinner(row, true);

  async function submitSaveAs() {
    try {
      const item = await ajaxPostNewItem(formDataItem);
      let newItem = new Item(
        item.componentName,
        item.subComponentName,
        item.defect,
        item.itemName,
        item.comment,
        item.price,
        item.originalFlag,
        item._id,
        item.categoryID,
        item.modifiedByUserID,
        item.createdByUserID,
        item.createdDateTime
      );
      allItems.push(newItem);
      filterUtility.runFilter(true);
      //Close the edit form
      closeEditFormDiv("", form);
    } catch (err) {
      processAndDisplayError(err, row, form);
    }
  }

  submitSaveAs();
}

function processAndDisplayError(err, row, form) {
  //Hide the spinner
  showHideEditFormSpinner(row, false);

  const errorType = err.responseJSON.errorType;
  const errorMessage = err.responseJSON.message;
  if (errorType === "validation") {
    const inputKey = err.responseJSON.inputKey;
    showEditFormInputErrors(row, inputKey, errorMessage);
  } else {
    // TODO Finish this
    const tokenErrorMessage = checkTokenErrorType(errorType);
    if (tokenErrorMessage) {
      // This is a token error. They must log in
      showFormError(form, "Token issue. Please login");
      logout();
    } else {
      //This is some other issue
      console.error(err);
      showFormError(form, errorMessage);
    }
  }
}

function ajaxPostNewItem(formDataItem) {
  return new Promise((resolve, reject) => {
    let token = "";
    if (user) {
      token = user.token;
    }

    //=============================
    // $.ajax({url: `http://localhost:5000/zlookup-api/items`,
    $.ajax({
      url: `${apiServer}/zlookup-api/items`,
      type: "POST",
      headers: { "x-auth-token": token },
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(formDataItem),
    })
      .done(function (respItem) {
        resolve(respItem);
      })
      .fail(function (responseData, textStatus, error) {
        reject(responseData);
      });
  });
}

function deleteItemByRecordID(id) {
  const filterUtility = myFilter();
  const allItems = filterUtility.allItems;
  //Find the item and remove from the array
  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].id == id) {
      allItems.splice(i, 1);
    }
  }
}

function ajaxDeleteItem(itemID) {
  return new Promise((resolve, reject) => {
    // The global user object is not set when not logged in
    let token = "";
    if (user) {
      token = user.token;
    }

    //=============================
    //$.ajax({url: `http://localhost:5000/zlookup-api/items/${itemID}`,
    $.ajax({
      url: `${apiServer}/zlookup-api/items/${itemID}`,
      type: "DELETE",
      headers: { "x-auth-token": token },
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      //data: JSON.stringify(formDataItem),
    })
      .done(function () {
        resolve();
      })
      .fail(function (responseData, textStatus, error) {
        reject(responseData);
      });
  });
}

function deleteItem(row, selectedItem) {
  //*** Delete ***

  const id = selectedItem.id;

  //Remove any error displays if there are some
  clearElementErrors(row);
  //get reference to this edit form
  var form = $(row).find(".pad_form");
  //Set the data object we will send to server
  //Show a spinner
  showHideEditFormSpinner(row, true);

  async function submitDeleteItem() {
    try {
      await ajaxDeleteItem(id);
      deleteItemByRecordID(id);
      //Close the edit form and then re-filter and display
      const filterUtility = myFilter();
      filterUtility.runFilter(true);
      closeEditFormDiv("", form);
    } catch (err) {
      processAndDisplayError(err, row, form);
    }
  }

  submitDeleteItem();
}

function ajaxItemUpdate(itemID, formDataItem) {
  return new Promise((resolve, reject) => {
    // The global user object is not set when not logged in
    let token = "";
    if (user) {
      token = user.token;
    }

    //=============================
    // $.ajax({url: `http://localhost:5000/zlookup-api/items/${itemID}`,
    $.ajax({
      url: `${apiServer}/zlookup-api/items/${itemID}`,
      type: "PUT",
      headers: { "x-auth-token": token },
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(formDataItem),
    })
      .done(function (respItem) {
        resolve(respItem);
      })
      .fail(function (responseData, textStatus, error) {
        reject(responseData);
      });
  });
}

function formSubmitUpdate(e, row, selectedItem) {
  //Remove any error displays if there are some
  clearElementErrors(row);
  //get reference this edit form
  const form = $(row).find(".pad_form");
  //Set the data object we will send to server
  const formDataItem = setFormDataObj(row, selectedItem);
  //Show a spinner
  showHideEditFormSpinner(row, true);

  async function submitFormSave() {
    try {
      const item = await ajaxItemUpdate(selectedItem.id, formDataItem);

      //Success
      selectedItem.componentName = item.componentName;
      selectedItem.defect = item.defect;
      selectedItem.name = item.itemName;
      selectedItem.comment = item.comment;
      selectedItem.price = item.price;
      selectedItem.category = item.categoryID;
      selectedItem.subComponentName = item.subComponentName;

      //Update the item display html
      $(row)
        .find(".component")
        .html(htmlspecialchars(selectedItem.componentName));
      //$(row).find(".commentName").html(selectedItem.name);
      $(row).find(".commentName").html(htmlspecialchars(selectedItem.name));
      //$(row).find(".commentText").html(selectedItem.comment);
      $(row).find(".commentText").html(htmlspecialchars(selectedItem.comment));
      // TODO2 this next line should really produce properly formatted currency
      $(row).find(".money").html(selectedItem.price);

      const filterUtility = myFilter();
      filterUtility.runFilter(true);
      loadResultsTable(filterUtility.keywordItems);

      //Close the edit form and then re-filter and display
      closeEditFormDiv("", form);
    } catch (err) {
      processAndDisplayError(err, row, form);
    }
  }
  submitFormSave();
}

function closeEditFormDiv(e, editFormDiv) {
  //Toggle the chevron
  var resultRow = $(editFormDiv).closest(".result_row");
  var chevron = $(resultRow).find(".edit_icon");
  chevron
    .toggleClass("glyphicon-chevron-down")
    .toggleClass("glyphicon-chevron-up");

  $(editFormDiv).slideUp("", function () {
    $(this).remove();
    //Reload categories so the counts are updated
    //loadCategories();
    //updateCategoryCounts();
    //Re-run the lookup
    lookupStart();
    const filterUtility = myFilter();
    loadResultsTable(filterUtility.keywordItems);
  });
}

class Item {
  constructor(
    componentName,
    subComponentName,
    defect,
    name,
    comment,
    price,
    originalFlag,
    id,
    category,
    modifiedByUser,
    createdByUser,
    createdDateTime
  ) {
    this.componentName = componentName;
    if (typeof subComponentName === "undefined") {
      this.subComponentName = "";
    } else {
      this.subComponentName = subComponentName;
    }
    if (typeof defect === "undefined") {
      this.defect = "";
    } else {
      this.defect = defect;
    }
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
    $(".view").each(function () {
      $(this).css("display", "none");
    });
    //Show the wanted view
    $(displayFormID).css("display", "block");
  }
  static clearView(displayFormID) {
    const formControls = $(displayFormID).find(".form-control");
    $(formControls).each(function (index) {
      $(this).val("");
    });
    //Clear any errors
    $(displayFormID).find(".form-group").removeClass("has-error");
    $(displayFormID).find(".help-block").remove();
    $(displayFormID).find(".standard_err_message").css("display", "none");
  }
}

class User {
  constructor(firstName, lastName, id, email, token) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.id = id;
    this.email = email;
    this.token = token;
  }
  getFullName() {
    return this.firstName + " " + this.lastName;
  }
}

function showSignUpForm() {
  View.clearView("#sign_up_form");
  View.showView("#sign_up_form");
}

function showResetPasswordForm() {
  View.clearView("#reset_password_form");
  View.showView("#reset_password_form");
}

function showForgotPasswordForm() {
  View.clearView("#forgot_password_form");
  View.showView("#forgot_password_form");
}

function showCommentForm() {
  View.clearView("#comments_form");
  View.showView("#comments_form");
  loadTextboxes("comment_input");
  loadTextboxes("fsl_input");
  updateDeltaT();
  updateStaticHeader();
}

function updateDeltaT() {
  const returnVent1 = $("#return_vent_1_input").val();
  const supplyVent1 = $("#supply_vent_1_cool_input").val();
  const returnVent2 = $("#return_vent_2_input").val();
  const supplyVent2 = $("#supply_vent_2_cool_input").val();

  var deltaT1 = (returnVent1 - supplyVent1).toFixed(1);
  var deltaT2 = (returnVent2 - supplyVent2).toFixed(1);

  $("#delta-t1_input").val(deltaT1).trigger("change");
  $("#delta-t2_input").val(deltaT2).trigger("change");
}

function showChecklistForm(formID, checkboxClass, textBoxClass) {
  View.clearView(`#${formID}`);
  View.showView(`#${formID}`);
  if (checkboxClass) loadCheckboxes(checkboxClass);
  if (textBoxClass) loadTextboxes(textBoxClass);
}

function loadCheckboxes(checkboxClass) {
  let elements = $(`.${checkboxClass}`).toArray();
  for (let i = 0; i < elements.length; i++) {
    const propertyName = $(elements[i]).attr("data-property-name");
    const isChecked = localStorage.getItem(propertyName);
    if (isChecked === "true") {
      $(elements[i]).prop("checked", true);
    } else {
      $(elements[i]).prop("checked", false);
    }
  }
}
function loadTextboxes(textBoxClass) {
  elements = $(`.${textBoxClass}`).toArray();
  for (let i = 0; i < elements.length; i++) {
    const propertyName = $(elements[i]).attr("data-property-name");
    $(`#${elements[i].id}`).val(localStorage.getItem(propertyName));
  }
}

function loadStatic(staticClass) {
  elements = $(`.${staticClass}`).toArray();
  for (let i = 0; i < elements.length; i++) {
    const propertyName = $(elements[i]).attr("data-property-name");
    $(`#${elements[i].id}`).html(localStorage.getItem(propertyName));
  }
}

function numberLinesofText(text) {
  let textLines = text.split("\n");
  //Make sure to trim each line
  let formattedText = "";
  let lineNumber = 0;
  for (let i = 0; i < textLines.length; i++) {
    lineNumber++;
    formattedText = formattedText.concat(`${lineNumber}. ${textLines[i]}\n`);
  }
  formattedText.trim();
  return formattedText;
}

function showLoginForm() {
  View.clearView("#login_form");
  View.showView("#login_form");
}

function showSearchBlock() {
  //Check if logged in
  View.showView("#search_block");
}

function hideSearchBlock() {
  $("#lookup_error").css("display", "none");
  $("#lookup_error").html("");
  $("#search_block").css("display", "none");

  //***Clean up any search stuff***
  //Clear lookup text
  $("#lookupText").val("");
  //Clean up any open edit forms
  $(".pad_form").remove();

  //Clear results in the result table
  $("#tbody").html("");
  //Clear the result count display
  $("#result_count").html("");
}

function ajaxSignup(firstName, lastName, email, password, confirmPassword) {
  var formData = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    confirmPassword: confirmPassword,
  };

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${apiServer}/zlookup-api/users`,
      type: "POST",
      data: JSON.stringify(formData),
      dataType: "json",
      contentType: "application/json; charset=utf-8",
    })
      .done(function (responseData, status, xhr) {
        //*** All is good ***
        resolve(responseData);
      })
      .fail(function (responseData, textStatus, error) {
        reject(responseData);
      });
  });
}

function submitSignUpForm() {
  //*** SIGN UP SUBMIT FUNCTION ***

  var form = $("#sign_up_form");

  removeFormErrors(form);

  showHideEditFormSpinner(form, true);

  //Remove any errors if there are some
  $(form).find(".form-group").removeClass("has-error");
  $(form).find(".help-block").remove();

  var firstName = $(form).find(".first_name").val();
  var lastName = $(form).find(".last_name").val();
  var email = $(form).find(".your_email").val();
  var password = $(form).find(".password").val();
  var confirmPassword = $(form).find(".confirm_password").val();

  async function submitAjaxRequests() {
    try {
      const responseData = await ajaxSignup(
        firstName,
        lastName,
        email,
        password,
        confirmPassword
      );
      showLoginForm();
    } catch (err) {
      const errorType = err.responseJSON.errorType;
      const errorMessage = err.responseJSON.message;
      if (errorType === "validation") {
        const inputKey = err.responseJSON.inputKey;
        switch (inputKey) {
          case "firstName":
            const firstNameGroup = $(form).find(".reg_first_name");
            $(firstNameGroup).addClass("has-error");
            $(firstNameGroup).append(
              '<div class="help-block">' + errorMessage + "</div>"
            );
            break;
          case "lastName":
            const lastNameGroup = $(form).find(".reg_last_name");
            $(lastNameGroup).addClass("has-error"); // add the error class to show red input
            $(lastNameGroup).append(
              '<div class="help-block">' + errorMessage + "</div>"
            );
            break;
          case "email":
            const emailGroup = $(form).find(".reg_email");
            $(emailGroup).addClass("has-error"); // add the error class to show red input
            $(emailGroup).append(
              '<div class="help-block">' + errorMessage + "</div>"
            );
            break;
          case "password":
            var confirmPasswordGroup = $(form).find(".reg_password");
            $(confirmPasswordGroup).addClass("has-error"); // add the error class to show red input
            $(confirmPasswordGroup).append(
              '<div class="help-block">' + errorMessage + "</div>"
            );
            break;
          case "confirmPassword":
            var confirmPasswordGroup = $(form).find(".reg_confirm_password");
            $(confirmPasswordGroup).addClass("has-error"); // add the error class to show red input
            $(confirmPasswordGroup).append(
              '<div class="help-block">' + errorMessage + "</div>"
            );
            break;
          default:
            //Handle non form validation error here
            showFormError(form, errorMessage);
            break;
        }
      } else {
        // TODO Finish this
        showFormError(form, errorMessage);
      }
      return;
    } finally {
      showHideEditFormSpinner(form, false);
    }
  }

  submitAjaxRequests();
}

function ajaxLogin(email, password) {
  let formData = {
    email: email,
    password: password,
  };

  return new Promise((resolve, reject) => {
    // $.ajax({url: "http://localhost:5000/zlookup-api/auth",
    $.ajax({
      url: `${apiServer}/zlookup-api/auth`,
      type: "POST",
      data: JSON.stringify(formData),
      dataType: "json",
      contentType: "application/json; charset=utf-8",
    })
      .done(function (responseData, status, xhr) {
        //*** All is good ***
        resolve(responseData);
      })
      .fail(function (responseData, textStatus, error) {
        reject(responseData);
      });
  });
}

function removeFormErrors(form) {
  //Remove any errors if there are some
  $(form).find(".form-group").removeClass("has-error");
  $(form).find(".help-block").remove();
  const errorMessageDiv = $(form).find(".standard_err_message");
  errorMessageDiv.css("display", "none");
}

function showFormError(form, errorMessage) {
  //Show regular non-input error message
  const errorMessageDiv = $(form).find(".standard_err_message");
  errorMessageDiv.css("display", "block");
  errorMessageDiv.html(errorMessage);
}

function submitLoginForm() {
  const form = $("#login_form");

  removeFormErrors(form);

  showHideEditFormSpinner(form, true);

  const loginEmail = $(form).find(".login_email").val();
  const loginPassword = $(form).find(".login_password").val();

  //Async wrapper to submit login call to server
  async function submitAjaxRequests() {
    try {
      const responseData = await ajaxLogin(loginEmail, loginPassword);
      user = new User(
        responseData.firstName,
        responseData.lastName,
        responseData.id,
        responseData.email,
        responseData.token
      );
    } catch (err) {
      const errorType = err.responseJSON.errorType;
      const errorMessage = err.responseJSON.message;
      if (errorType === "validation") {
        const inputKey = err.responseJSON.inputKey;
        switch (inputKey) {
          case "email":
            const loginEmailGroup = $(form).find(".log_login_email");
            $(loginEmailGroup).addClass("has-error");
            $(loginEmailGroup).append(
              '<div class="help-block">' + errorMessage + "</div>"
            );
            break;
          case "password":
            const loginPasswordGroup = $(form).find(".log_login_password");
            $(loginPasswordGroup).addClass("has-error"); // add the error class to show red input
            $(loginPasswordGroup).append(
              '<div class="help-block">' + errorMessage + "</div>"
            );
            break;
          default:
            //Handle non form validation error here
            showFormError(form, errorMessage);
            break;
        }
      } else {
        // TODO Finish this
        showFormError(form, errorMessage);
      }
      return;
    } finally {
      showHideEditFormSpinner(form, false);
    }

    //Show the search screen
    showSearchBlock();

    //Clear results in the result table
    var tableBody = document.getElementById("tbody");
    tableBody.innerHTML = "";

    //Load items, categories, etc
    try {
      await loadInitialData();
    } catch {
      showLoginForm();
    }

    loadCategories();
    filterAndLoadByCategorySelected();

    //Show logout menu button
    $("#logout_menu_item").css("display", "block");
    //Hide login menu button
    $("#login_menu_item").css("display", "none");
    //display user name id is user_info
    const displayName = user.getFullName();
    $("#user_info").html(displayName);
  }

  submitAjaxRequests();
}

function getCategoryID() {
  return $("#category_select option:selected").val();
}

function filterAndLoadByCategorySelected() {
  const filterUtility = myFilter();
  //Form stuff
  lookupStart();
  //Filter based on form values
  const filteredItems = filterUtility.runFilter();

  loadResultsTable(filteredItems);
}

function getLookupText() {
  return $("#lookupText").val().trim();
}

function submitResetPasswordForm() {
  const form = $("#reset_password_form");

  //Remove any errors if there are some
  $(form).find(".form-group").removeClass("has-error");
  $(form).find(".help-block").remove();

  const newPassword = $(form).find(".enter_password_input").val();
  const confirmPassword = $(form).find(".reenter_password_input").val();

  const formData = {
    newPassword: newPassword,
    confirmPassword: confirmPassword,
  };

  $.post(
    "php/resetPassword.php",
    formData,
    function (responseData) {
      if (!responseData.success) {
        //Show any form errors

        const enter_password_group = $(form).find(".enter_password_group");
        if (responseData.errors.newPassword) {
          $(enter_password_group).addClass("has-error");
          $(enter_password_group).append(
            '<div class="help-block">' +
              responseData.errors.newPassword +
              "</div>"
          );
        }
        const reenter_password_group = $(form).find(".reenter_password_group");
        if (responseData.errors.confirmPassword) {
          $(reenter_password_group).addClass("has-error"); // add the error class to show red input
          $(reenter_password_group).append(
            '<div class="help-block">' +
              responseData.errors.confirmPassword +
              "</div>"
          );
        }

        if (responseData.errors.misc) {
          alert(responseData.errors.misc);
        }
      } else {
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
    },
    "json"
  ).fail(function (responseData, textStatus, error) {
    //Show the error information
    console.error(
      "submitSignUpForm failed, status: " + textStatus + ", error: " + error
    );
    alert("submitSignUpForm failed. Check logs");
  });
}

function logout() {
  //Null out the user object
  user = null;
  //Clean up any open edit forms in the search block
  //Delete any data downloaded when logging in and / or loading data
  $(".pad_form").remove();

  //Empty the items arrays
  myFilter().clearAll();
  //Empty the categories array and select list
  categories = [];
  $("#category_select").empty();
  //Remove the logout menu button
  $("#logout_menu_item").css("display", "none");
  //Show the login menu button
  $("#login_menu_item").css("display", "block");
  //remove the user info html at .user_info paragraph
  $("#user_info").html("");
  //Clear any text left in the lookup text
  $("#lookupText").val("");
  //Clear results in the result table
  $("#tbody").html("");
  //Clear the result count display
  $("#result_count").html("");
  //
  showLoginForm();
}

var htmlspecialchars = function (string) {
  //*** I got this function from a google search ***
  // Our finalized string will start out as a copy of the initial string.
  var escapedString = string;

  // For each of the special characters,
  var len = htmlspecialchars.specialchars.length;
  for (var x = 0; x < len; x++) {
    // Replace all instances of the special character with its entity.
    escapedString = escapedString.replace(
      new RegExp(htmlspecialchars.specialchars[x][0], "g"),
      htmlspecialchars.specialchars[x][1]
    );
  }

  // Return the escaped string.
  return escapedString;
};

function clearLookupText() {
  $("#lookupText").val("");
  filterAndLoadByCategorySelected();
}

function clearCatLookup() {
  $("#category_lookup").val("");
  $("#sub_category_select").val("");
  $("#defect_select").val("");
  filterAndLoadByCategorySelected();
}

// A collection of special characters and their entities.
htmlspecialchars.specialchars = [
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
];

var htmlspecialchars_decode = function (string) {
  //*** I got this function from a google search ***
  // Our finalized string will start out as a copy of the initial string.
  var unescapedString = string;

  // For each of the special characters,
  var len = htmlspecialchars_decode.specialchars.length;
  for (var x = 0; x < len; x++) {
    // Replace all instances of the entity with the special character.
    unescapedString = unescapedString.replace(
      new RegExp(htmlspecialchars_decode.specialchars[x][1], "g"),
      htmlspecialchars_decode.specialchars[x][0]
    );
  }

  // Return the unescaped string.
  return unescapedString;
};

htmlspecialchars_decode.specialchars = [
  ['"', "&quot;"],
  [">", "&gt;"],
  ["<", "&lt;"],
  ["&", "&amp;"],
];

function saveChecklistItemValue(el) {
  //Use this function to handle all checklist type saves when checked
  const propertyName = el.attr("data-property-name");
  let isChecked = "false";
  if ($(el).is(":checked")) {
    isChecked = "true";
  }
  localStorage.setItem(propertyName, isChecked);
}

function clearLocalStorage(elementClass) {
  const elements = $(`.${elementClass}`).toArray();
  for (let i = 0; i < elements.length; i++) {
    const propertyName = $(elements[i]).attr("data-property-name");
    //let value = localStorage.getItem(propertyName);
    localStorage.removeItem(propertyName);
  }
}

function getLookupWords() {
  const lookupText = getLookupText();
  const lookupWords = lookupText.split(" ");
  return lookupWords;
}

function getSubCategoryValue() {
  let value = $("#sub_category_select option:selected").val();
  if (!value) value = "";
  value = value.trim();
  return value;
}

function getDefectValue() {
  let value = $("#defect_select option:selected").val();
  if (!value) value = "";
  value = value.trim();
  return value;
}

$(document).ready(function () {
  //$('.alert-fixed').hide();
  $("#myalert").hide();

  //Make sure the edit form is hidden
  //$('#pad_form').hide();

  //$('.result_table').show();

  selectedItem = "";

  //Categories array. IE. Electrical, Plumbing, Paint, etc.
  categories = [];

  //Initialize a global selected paragraph var
  selectedParId = "";

  //Get header values from localstorage and update
  updateStaticHeader();

  //Initialize user to null because we don't have one yet
  //If we start using cookies or have a way to store the JWT
  //then we will want to make an AJAX call to check if it's still valid
  user = null;
  // The global user object is not set when not logged in
  if (!user) {
    showLoginForm();
  }

  apiServer = "https://zlookup-api.herokuapp.com";
  if (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === ""
  ) {
    console.log("Using local host");
    //$
    $("#login_email").val("pauld@zillowgroup.com");
    apiServer = "http://localhost:5000";
  } else {
    console.log("Using Heroku");
  }

  //Attempt to load data. If not logged in it will show login instead
  $("#load_menu_item").on("click", function (e) {
    (async function () {
      try {
        showHideEditFormSpinner(null, true);
        await loadInitialData();
        loadCategories();
        lookupStart();
        $("#category_lookup").val("");
        const filterUtility = myFilter();
        filterUtility.runFilter(true);
        //loadResultsTable(filterUtility.subCategoryItems);
        loadResultsTable(filterUtility.keywordItems);
      } catch (err) {
        showLoginForm();
      } finally {
        showHideEditFormSpinner(null, false);
        $("#myNavbar").collapse("hide");
      }
    })();
  });

  //Event handlers
  // $(window).on('focus', function(){
  // });

  $("#myalert").on("click", function () {
    $("#myalert").hide();
  });

  // *** THE FILTER STUFF ***
  $("#category_select").change(function () {
    filterAndLoadByCategorySelected();
  });
  $("#category_lookup").on("keyup", function () {
    categoryLookup();
  });
  $("#sub_category_select").change(function () {
    filterAndLoadByCategorySelected();
  });
  $("#defect_select").change(function () {
    filterAndLoadByCategorySelected();
  });
  $("#lookupText").on("keyup", function (e) {
    filterAndLoadByCategorySelected();
  });

  $("#clear_button").on("click", function (e) {
    clearLookupText();
    $("#lookupText").focus();
  });
  $("#clear_cat_button").on("click", function () {
    clearCatLookup();
    $("#category_lookup").focus();
  });
  $("#clear_cat_button_all").on("click", function () {
    clearCatLookup();
    clearLookupText();
    $("#category_lookup").focus();
  });

  $("#edit_menu_item").on("click", function (e) {
    alert("Temporarily disabled");
  });

  $("#refresh_menu_item").on("click", function (e) {
    reloadFunction();
  });
  //=========================
  $("#sign_up_menu_item").on("click", function (e) {
    showSignUpForm();
  });
  $("#reset_password").on("click", function (e) {
    showResetPasswordForm();
    $("#myNavbar").collapse("hide");
  });
  $("#forgot_password").on("click", function (e) {
    showForgotPasswordForm();
    $("#myNavbar").collapse("hide");
  });
  $("#comments_menu_item").on("click", function () {
    showCommentForm();
    $("#myNavbar").collapse("hide");
  });

  $("#lookup_menu_item").on("click", function (e) {
    showSearchBlock();
    $("#myNavbar").collapse("hide");
  });
  $("#login_menu_item").on("click", function (e) {
    showLoginForm();
    $("#myNavbar").collapse("hide");
  });
  //========================
  $("#logout_menu_item").on("click", function (e) {
    logout();
    $("#myNavbar").collapse("hide");
  });
  $(".to-top-btn").on("click", function (e) {
    $(window).scrollTop(0);
  });
  $("#info_menu_item").on("click", function (e) {
    $("#myNavbar").collapse("hide");
    alert("Info Modal Here");
    //$("#myModal").modal();
  });
  $("#submit_button").on("click", function () {
    submitSignUpForm();
  });
  $("#login_submit_button").on("click", function () {
    submitLoginForm();
  });
  $("#login_here_link").on("click", function () {
    showLoginForm();
  });
  $("#reset_password_button").on("click", function () {
    submitResetPasswordForm();
  });

  $("#clear_comments_button").on("click", function () {
    clearLocalStorage("comment_input");
    clearLocalStorage("fsl_input");
    loadTextboxes("comment_input");
    loadTextboxes("fsl_input");
    updateDeltaT();
  });

  $("#copy_comments_button").on("click", function () {
    //Clear any errors
    const commentsForm = $("#comments_form");
    clearElementErrors(commentsForm);
    // $(commentsForm).find(".form-group").removeClass('has-error');
    // $(commentsForm).find(".help-block").remove();
    //Loop all comments and add keys and values to an object
    let commentObj = {};
    let hasErrors = false;
    let elements = $("#comments_form").find(".form-control").toArray();
    for (let i = 0; i < elements.length; i++) {
      const propertyName = $(elements[i]).attr("data-property-name");
      let value = localStorage.getItem(propertyName);

      if (!value && !$(elements[i]).hasClass("exclude_check")) {
        hasErrors = true;
        let parentGroup = $(elements[i]).parent(".form-group");
        $(parentGroup).addClass("has-error");
        $(parentGroup).append('<div class="help-block">Cannot be empty!</div>');
      }

      if (!value) value = ""; //Keeps from being null
      //If this is a list type field then add numbers
      if ($(elements[i]).hasClass("comment_input_list") && value) {
        value = numberLinesofText(value);
      }
      commentObj[propertyName] = value; //Add property and value to the comment object
    }

    let formattedComment = "";
    if (commentObj.specLevel)
      formattedComment = formattedComment.concat(
        `[Spec Level: ${commentObj.specLevel}]`
      );
    if (commentObj.squareFeetListed)
      formattedComment = formattedComment.concat(
        ` - [Sq ft: ${commentObj.squareFeetListed}/${commentObj.squareFeetMeasured}]`
      );
    //if (commentObj.beds) formattedComment = formattedComment.concat(` - [Bed/bath: ${commentObj.beds}/${commentObj.baths}]`);
    if (commentObj.deltaT1)
      formattedComment = formattedComment.concat(
        ` - [Temp split (1st floor): ${commentObj.deltaT1}]`
      );
    if (commentObj.deltaT2)
      formattedComment = formattedComment.concat(
        ` - [Temp split (2nd floor): ${commentObj.deltaT2}]`
      );
    if (commentObj.deltaT3)
      formattedComment = formattedComment.concat(
        ` - [Temp split (3rd floor): ${commentObj.deltaT3}]`
      );
    if (commentObj.woodWindows)
      formattedComment = formattedComment.concat(
        ` - [Wood Windows Present?: ${commentObj.woodWindows}]`
      );
    if (commentObj.gas)
      formattedComment = formattedComment.concat(
        ` - [Gas on/off: ${commentObj.gas}]`
      );
    if (commentObj.heatTested)
      formattedComment = formattedComment.concat(
        ` - [Heat Tested?: ${commentObj.heatTested}]`
      );
    if (commentObj.coolTested)
      formattedComment = formattedComment.concat(
        ` - [Cool Tested?: ${commentObj.coolTested}]`
      );
    if (commentObj.appliancesTaken)
      formattedComment = formattedComment.concat(
        ` - [Appliances Being Taken: ${commentObj.appliancesTaken}]`
      );
    if (commentObj.garageRemotes)
      formattedComment = formattedComment.concat(
        ` - [Garage Remotes: ${commentObj.garageRemotes}]`
      );
    if (commentObj.inAttendance)
      formattedComment = formattedComment.concat(
        ` - [In Attendance: ${commentObj.inAttendance}]`
      );
    if (commentObj.outsideTemp)
      formattedComment = formattedComment.concat(
        ` - [Outside Temp: ${commentObj.outsideTemp}]`
      );
    if (commentObj.externalities)
      formattedComment = formattedComment.concat(
        ` - [Noted externalities: ${commentObj.externalities}]`
      );
    if (commentObj.notes)
      formattedComment = formattedComment.concat(
        ` - [Add Notes: ${commentObj.notes}]`
      );

    if (!hasErrors) {
      updateClipboard(formattedComment);
      showMyAlert("Copied to clipboard!", "success");
    } else {
      showMyAlert("Incomplete items!", "danger");
    }
  });

  $(".comment_input").on("change", function (e) {
    const el = $(e.target);
    const propertyName = el.attr("data-property-name");
    const value = $.trim($(el).val());
    localStorage.setItem(propertyName, value);
  });

  $(".fsl_input").on("change keyup paste", function (e) {
    //I think paste might need a timer. It's not working on the iPad
    const el = $(e.target);
    const propertyName = el.attr("data-property-name");
    const value = $.trim($(el).val());
    localStorage.setItem(propertyName, value);
    if (el.hasClass("ac_input")) {
      updateDeltaT();
    }
  });

  $(".header_info").on("change keyup paste", function (e) {
    //I think paste might need a timer. It's not working on the iPad
    const el = $(e.target);
    const propertyName = el.attr("data-property-name");
    const value = $.trim($(el).val());
    localStorage.setItem(propertyName, value);
    updateStaticHeader();
  });

  //* CHECKLIST MENU EVENTS */
  $("#pre_checklist_menu").on("click", function () {
    showChecklistForm("pre_checklist_form", "checklist_pre", "header_info");
    $("#myNavbar").collapse("hide");
  });
  $("#susan_checklist_menu").on("click", function () {
    showChecklistForm("discussion_checklist_form", "checklist_discussion", "");
    updateStaticHeader();
    $("#myNavbar").collapse("hide");
  });
  $("#main_checklist_menu").on("click", function () {
    showChecklistForm("main_checklist_form", "checklist_main", "");
    $("#myNavbar").collapse("hide");
  });
  /* CLEAR CHECKLIST BUTTON EVENTS */
  $("#clear_pre-checklist_button").on("click", function () {
    clearLocalStorage("checklist_pre");
    clearLocalStorage("header_info");
    loadCheckboxes("checklist_pre");
    loadTextboxes("header_info");
    updateStaticHeader();
  });
  $("#clear_discussion_button").on("click", function () {
    clearLocalStorage("checklist_discussion");
    loadCheckboxes("checklist_discussion");
  });
  $("#clear_main_checklist_button").on("click", function () {
    clearLocalStorage("checklist_main");
    loadCheckboxes("checklist_main");
  });
  $("#clear_all").on("click", function () {
    //Remove date from Local Storage by looping the following elements by
    //class and then get the data-property-name attribute
    clearLocalStorage("checklist_pre");
    clearLocalStorage("header_info");
    clearLocalStorage("checklist_discussion");
    clearLocalStorage("checklist_main");
    clearLocalStorage("comment_input");
    clearLocalStorage("fsl_input");
    //Fill in the form elements
    loadCheckboxes("checklist_pre");
    loadTextboxes("header_info");
    loadCheckboxes("checklist_discussion");
    loadCheckboxes("checklist_main");
    loadTextboxes("comment_input");
    loadTextboxes("fsl_input");
    updateDeltaT();
    loadStatic("header_static");
    updateStaticHeader();
    $("#myNavbar").collapse("hide");
  });
  /* CHECKLIST ITEMS HANDLER - WHEN CLICKED */
  $(".checklist_checkbox_input").on("change", function () {
    const el = $(this);
    saveChecklistItemValue(el);
  });

  //Modal copy button click
  $("#copy_item_button").on("click", function () {
    //Copy text to clipboard
    const newValue = $("#modal_text_input").val();
    updateClipboard(newValue);
  });

  //Modal Add to List button
  $("#add_to_list_button").on("click", function () {
    //Copy text to clipboard
    const newValue = $("#modal_text_input").val();
    //Get a stringify version of the Item
    const itemAsString = $("#item_object_stringify").html();
    const item = JSON.parse(itemAsString);

    //updateClipboard(newValue);
    updateLocalStorage(item.category, newValue);
    //showMyAlert();
  });

  $("#rpm_menu_item").on("click", function () {
    View.clearView("#rpm_report_form");
    View.showView("#rpm_report_form");
    updateStaticHeader();

    const tbody = $("#rpm_t_body");

    //Clear then load table
    $(tbody).html("");

    //Sort the FSL items
    let fslSortedArray = $(".fsl_input").sort((a, b) => {
      return $(a).attr("data-sort") - $(b).attr("data-sort");
    });

    $(fslSortedArray).each(function () {
      let labelVal = $(this).siblings("label").html();
      switch (labelVal) {
        case "Bedrooms":
          $(tbody).append(
            '<tr class="rpm_heading"><td>Rooms</td><td></td></tr>'
          );
          break;
        case "Above Grade Square Footage":
          $(tbody).append(
            '<tr class="rpm_heading"><td>Square Footage</td><td></td></tr>'
          );
          break;
        case "Water Heater 1 Manufactured Year":
          $(tbody).append(
            '<tr class="rpm_heading"><td>Water Heaters</td><td></td></tr>'
          );
          break;
        case "Furnace 1 Manufactured Year":
          $(tbody).append(
            '<tr class="rpm_heading"><td>HVAC</td><td></td></tr>'
          );
          break;
        default:
          break;
      }

      let value = localStorage.getItem($(this).attr("data-property-name"));
      value = value ? value : "";
      let row = `<tr><td>${labelVal}</td><td>${value}</td></tr>`;
      $(tbody).append(row);
    });

    $("#myNavbar").collapse("hide");
  });

  $("#does_nothing_button").on("click", function () {
    alert("This does not do anything yet");
  });
});
