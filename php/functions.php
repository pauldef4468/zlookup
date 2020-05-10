<?php

	
	function loggedIn() {
		if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] == true) {
			return true;
		} else {
			return false;
		}
	}
	
	function checkPasswordLength($password){
		if(strlen($password) > 4){
			return true;
		}else{
			return false;
		}
	}
	
?>