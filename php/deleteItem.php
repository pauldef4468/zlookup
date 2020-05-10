<?php

	session_start();
	include 'functions.php';
	include '../database/pdo_connect.php';
	
	$responseData = []; //Main json response
	$errors = [];
	
	if(loggedIn()){
		$userID = $_SESSION['id'];
		$responseData['loggedin'] = true;
	} else {
		$responseData['loggedin'] = false;
		$responseData['success'] = false;
		echo json_encode($responseData);
		exit;
	}
	
	$recordID = trim($_POST['recordID']);
	
	if (empty($recordID)){
		$errors['other'] = 'No record ID sent with request';
	}
	
	if(!$errors){
		//Update the record
		$values = [
			'id' => $recordID,
		];
		
		try{
			$sql = "DELETE FROM comments WHERE id=:id"; 
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