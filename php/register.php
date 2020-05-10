<?php

	include '../database/pdo_connect.php';
	
	$responseData = []; //Main json response
	$errors = []; //For invalid form entries
	
	$firstName = trim($_POST['firstName']);
	$lastName = trim($_POST['lastName']);
	$password = trim($_POST['password']);
	$confirmPassword = trim($_POST['confirmPassword']);
	$email = trim($_POST['email']);
	
	//Validate email
	if(empty($email)){
		//The email is empty, add to the errors array
		$errors['email'] = 'valid email is required.';
	}else{
		
		//We have email so check if it already exists
		$values = ['email'=>$email];
		
		try{
			$sql = "SELECT id FROM users WHERE email = :email";
			$stmt = $pdo->prepare($sql);
			$stmt->execute($values);
		}
		
		catch(Exception $e){
			//Something went wrong with query
			$responseData['success'] = false;
			$errors['queryException'] = $e;
			$responseData['errors']  = $errors;
			echo json_encode($responseData);
			die();
		}
		//See if we found an already exising record
		$arr = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if(count($arr)){
			//Already exists
			$errors['email'] = 'Email already in use.';
		}else{
			
		}
	}
	
	//Validate the rest of the form fields
	if (empty($firstName )){
		$errors['firstName'] = 'First name is required.';
	}
	if (empty($lastName)){
		$errors['lastName'] = 'Last name is required.';
	}
	if (empty($password)){
		$errors['password'] = 'Password is required.';
	}
	if ($password != $confirmPassword){
		$errors['confirmPassword'] = 'Passwords do not match';
	}
	
	//TODO2 Remove this at some point. We don't want just anoyone logging in
	//$errors['other'] = 'No more allowed';
	
	$passwordHash = password_hash($password,PASSWORD_DEFAULT);
	
	//If no errors from above insert a record here
	if(!$errors){
		$values = ['firstName'=>$firstName,
			'lastName'=>$lastName,
			'password'=>$passwordHash,
			'email'=>$email
		];
		
		$sql = "INSERT INTO users(firstName,lastName,password,email)VALUES(:firstName, :lastName, :password, :email)";
		try{
			$stmt = $pdo->prepare($sql);
			$stmt->execute($values);
		}
		catch(Exception $e){
			//Query failed so add a query error item 
			$errors['queryException'] = $e;
		}
	}
	
	//Check for any errors above
	if(!$errors){
		$responseData['success'] = true;
	}else{
		$responseData['success'] = false;
	}
	
	
	//Add errors to responseData object
	$responseData['errors']  = $errors;
	echo json_encode($responseData);
	
?>