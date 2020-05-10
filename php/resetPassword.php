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
	$newPassword = trim($_POST['newPassword']);
	$confirmPassword = trim($_POST['confirmPassword']);
	
	// TODO finish this reset password stuff
	//Validate data
	if(!checkPasswordLength($newPassword)){
		$errors['newPassword'] = 'Please too short';
	}
	if (empty($newPassword)){
		$errors['newPassword'] = 'Please enter a password';
	}
	if (empty($confirmPassword)){
		$errors['confirmPassword'] = 'Please enter a confirm password';
	}
	if($newPassword !== $confirmPassword){
		$errors['newPassword'] = 'Passwords do not Match';
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