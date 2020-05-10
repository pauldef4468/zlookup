
<?php



/*  	function customError($errno, $errstr, $error_file, $error_line, $error_context) {
		
		//$err = [];
		echo "Error: [$errno] $errstr $error_file $error_line";
		//echo "Error: $errno $errstr ";
		echo "Ending Script";

		die();
	}

	set_error_handler("customError"); */
	
	

	$dsn = "mysql:host=mi3-ss45.a2hosting.com;dbname=triangl6_zlookup;charset=utf8mb4";
	$options = [
	  PDO::ATTR_EMULATE_PREPARES   => false, // turn off emulation mode for "real" prepared statements
	  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, //turn on errors in the form of exceptions
	  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, //make the default fetch be an associative array
	];

	try {
		
	  $pdo = new PDO($dsn, "triangl6_paul", "Tt^H;mJd@!i#", $options);
	  
	} catch (Exception $e) {
		//Log exception message to server error logs
	  error_log($e->getMessage()); 
	  die();
	}
	
	
	
?>