<?php
	include '../database/database.php';
	
	//print_r(PDO::getAvailableDrivers());
	//die();
	
	if(!isset($myPDO)){
		die('Something went wrong with db connection');
	}
	
	$result = $myPDO->query("SELECT * FROM comments");
	if(!isset($result)){
		die('Result is nothing');
	}
	
	foreach ($result as $row) {
        print "here" ."<br/>";
    }
	
	if ($result->num_rows > 0) {
    // output data of each row
		while($row = $result->fetch_assoc()) {
			echo "id: " . $row["id"]. " - Name: " . $row["firstname"]. " " . $row["lastname"]. "<br>";
		}
	} else {
		echo "0 results";
	}
	
	$myPDO->close();
	
	
/* 	// $attrs is optional, this demonstrates using persistent connections,
	// the equivalent of mysql_pconnect
	$attrs = array(PDO::ATTR_PERSISTENT => true);

	// connect to PDO
	$pdo = new PDO("mysql:host=localhost;dbname=test", "user", "password", $attrs);

	// the following tells PDO we want it to throw Exceptions for every error.
	// this is far more useful than the default mode of throwing php errors
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	// prepare the statement. the place holders allow PDO to handle substituting
	// the values, which also prevents SQL injection
	$stmt = $pdo->prepare("SELECT * FROM product WHERE productTypeId=:productTypeId AND brand=:brand");

	// bind the parameters
	$stmt->bindValue(":productTypeId", 6);
	$stmt->bindValue(":brand", "Slurm");

	// initialise an array for the results 
	$products = array();
	if ($stmt->execute()) {
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$products[] = $row;
		}
	}

	// set PDO to null in order to close the connection
	$pdo = null; */
	
	
	//$myJSON = json_encode($result);
	
	//echo $myJSON;
?>