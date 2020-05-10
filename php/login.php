<?php

	session_start();
	
	//Check if already logged in
	if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
		//header("location: welcome.php");
		//exit;
	}
	
	//Database connection
	include '../database/pdo_connect.php';
	
	$loginEmail = trim($_POST['loginEmail']);
	$loginPassword = trim($_POST['loginPassword']);
	
	//Init Response objects
	$responseData = []; ////Array of different objects returned
	$errors = []; //For invalid form entries
	$userObj = [];
	
	
	if (empty($loginEmail)){
		$errors['loginEmail'] = 'Email is required.';
	}
	
	if (empty($loginPassword)){
		$errors['loginPassword'] = 'Password is required.';
	}

	if(!$errors){
		
		//Check database to see if email is registered
		$values = ['loginEmail'=>$loginEmail
		];
		
		$sql = "SELECT id, firstName, lastName, email, password FROM users WHERE email = :loginEmail";
		try{
			$stmt = $pdo->prepare($sql);
			$stmt->execute($values);
			$arr = $stmt->fetchAll(PDO::FETCH_ASSOC);

		}
		catch(Exception $e){
			//Query failed so add a query error item 
			$errors['misc'] = $e;
		}

		if(!$errors){
			if(count($arr) > 1){
				$errors['misc'] = "Too many records returned";
			}elseif(count($arr) == 0){
				$errors['misc'] = "Email is not registered";
			}else{
				$user = $arr[0];
				$hashed_password = $user['password'];
				if(password_verify($loginPassword, $hashed_password)){
					// Password is correct, so start a new session
					//session_start();
					// Store data in session variables
					$_SESSION["loggedin"] = true;
					$_SESSION["id"] = $user['id'];
					$_SESSION["email"] = $user['email']; 
					$_SESSION['firstName'] = $user['firstName'];
					$_SESSION['lastName'] = $user['lastName'];
					//Set up the user object
					$userObj['id'] = $user['id'];
					$userObj['firstName'] = $user['firstName'];
					$userObj['lastName'] = $user['lastName'];
					$userObj['email'] = $user['email'];

				} else{
					// Display an error message if password is not valid
					$errors['misc'] = "The password was not valid.";
				}
			}
		}

	}

	
	if(!$errors){
		$responseData['success'] = true;
		$responseData['user'] = $userObj;
	}else{
		$responseData['success'] = false;
	}
	
	
	//Add errors to responseData object
	$responseData['errors']  = $errors;
	echo json_encode($responseData);

?>