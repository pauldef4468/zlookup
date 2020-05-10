<?php
	
	session_start();
	include 'functions.php';
	include '../database/pdo_connect.php';
	
	$responseData = []; //Main json response
	$errors = []; //For invalid form entries
	
	if(loggedIn()){
		$userID = $_SESSION['id'];
		$responseData['loggedin'] = true;
	} else {
		$responseData['loggedin'] = false;
		$responseData['success'] = false;
		echo json_encode($responseData);
		exit;
	}
	//Set formData vars
	$componentName = trim($_POST['componentName']);
	$renoWalkName = trim($_POST['renoWalkName']);
	$comment = trim($_POST['comment']);
	$databaseID = trim($_POST['databaseID']);
	$price = trim($_POST['price']);
	$categoryID = trim($_POST['categoryID']);
	
	//Set form errors if applicable
	if (empty($componentName)){
		$errors['componentName'] = 'Component name is required.';
	}
	if (empty($renoWalkName)){
		$errors['renoWalkName'] = 'A comment name is required.';
	}
	if (empty($comment)){
		$errors['comment'] = 'A comment is required.';
	}
	if (empty($price)){
		$errors['price'] = 'No price sent with form data';
	}
	
	//Check for other errors
	if (empty($databaseID)){
		$errors['other'] = 'No databaseID sent with form data.';
	}
	if (empty($categoryID)){
		$errors['other'] = 'No category ID sent with form data';
	}
	
	if(!$errors){
		//Update the record
		$values = [
			'component_name' => $componentName,
			'item_name' => $renoWalkName,
			'comment' => $comment,
			'id' => $databaseID,
			'price' => $price,
			'modifiedByUserID' => $userID,
			'categoryID' => $categoryID
		];
		
		try{
			$sql = "UPDATE comments SET 
			component_name=:component_name, 
			item_name=:item_name, 
			price=:price,
			comment=:comment,
			modifiedByUserID=:modifiedByUserID,
			categoryID=:categoryID,
			modifiedDateTime=now()
			WHERE id=:id";
			$stmt = $pdo->prepare($sql);
			$stmt->execute($values);
		}
		
		catch(Exception $e){

			$errors['other'] = 'Database error';
			error_log($e->getMessage());

		}
		
	}
	
	if(!$errors){
		$responseData['success'] = true;
	}else{
		$responseData['success'] = false;
	}
	
	//Add errors to responseData object
	$responseData['errors']  = $errors;
	echo json_encode($responseData);

?>