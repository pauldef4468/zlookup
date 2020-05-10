<?php

	session_start();
	
	include '../database/pdo_connect.php';
	include 'functions.php';
	
	$responseData = []; //Array of different objects returned
	$loginStatus = false;
	$userObj = [];
	$categories = [];
	
	if(loggedIn()){
		$responseData['loggedin'] = true;
		//Set the userObj based on the session variables and send 
		//back with response
		$userObj['id'] = $_SESSION['id'];
		if(isset($_SESSION['firstName'])){
			$userObj['firstName'] = $_SESSION['firstName'];
			$userObj['lastName'] = $_SESSION['lastName'];
			$userObj['email'] = $_SESSION['email'];
		}
	}else{
		//Not logged in
		$responseData['loggedin'] = false;
		echo json_encode($responseData);
		exit;
	}
	
 	try{
		//$stmt = $pdo->prepare("SELECT * FROM comments");
		$stmt = $pdo->prepare("SELECT comments.*, users.firstName, users.lastName FROM comments, users WHERE comments.createdByUserID = users.id");
		$stmt->execute([]);
		$arr = $stmt->fetchAll(PDO::FETCH_ASSOC);
	}
	catch(Exception $e){

	}
	
 	try{
		$stmt = $pdo->prepare("SELECT id, name, createdDateTime FROM categories
		ORDER BY name ASC;");
		$stmt->execute([]);
		$categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
	}
	catch(Exception $e){

	}
	
	if(!$arr){
		//No rows. 
		//We should never really have no rows returned. Data will always be there
	}	

	$stmt = null;
	
	$responseData['items']  = $arr;
	$responseData['user'] = $userObj;
	$responseData['categories'] = $categories;
	
	echo json_encode($responseData);

?>