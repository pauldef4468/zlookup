

<?php
	// used to connect to the database
	$host = "localhost";
	$db_name = "triangl6_zlookup";
	$username = "triangl6_paul";
	$password = "Tt^H;mJd@!i#";
	  
	try {
		$myPDO = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
	}
	  
	// show error
	catch(PDOException $exception){
		echo "Connection error: " . $exception->getMessage();
	}
?>