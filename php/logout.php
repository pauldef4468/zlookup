<?php
// Initialize the session
session_start();

$responseData = [];
 
// Unset all of the session variables
$_SESSION = array();
 
// Destroy the session.
session_destroy();
 
 $responseData['success'] = true;
 echo json_encode($responseData);

?>