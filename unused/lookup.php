<?php

	//http://localhost/zlookup/php/lookup.php
	

	
class CommentObj {
	
	public $componentName;
    public $renoWalkName;
    public $comment;
	public $price;
	public $originalFlag;
	public $includeFlag;
	
	function set_component_name($componentName){
		$this->componentName = $componentName;
	}
	
	function set_renowalk_name($name){
		$this->renoWalkName = $name;
	}
	function set_comment($comment){
		$this->comment = $comment;
	}
	function set_price($price){
		$this->price = $price;
	}
	function set_original_flag($originalFlag){
		$this->originalFlag = $originalFlag;
	}
	function set_include_flag($includeFlag){
		$this->includeFlag = $includeFlag;
	}
}
	
if (($handle = fopen('../support/CommentLibrary.csv', "r")) !== FALSE) {
	
	
	//Array of comments
	$commentObjects = array();
	
	$i = 0;

	//Get rows with a valid date in the first cell
	while (($data = fgetcsv($handle, 0, ",")) !== FALSE) {
		
		//Ignore first header row
		$i++;
		if($i == 1){continue;}
		
		$commentObj = new CommentObj();
		$commentObj->set_component_name($data[0]);
		$commentObj->set_renowalk_name($data[1]);
		$commentObj->set_comment($data[2]);
		$commentObj->set_price($data[3]);
		$commentObj->set_original_flag($data[4]);
		$commentObj->set_include_flag($data[5]); 
		
		//echo $data[1] . "  |  " . $data[2] . '<br>';
		
		if (isset($commentObj)) {
			//Add to array
			array_push($commentObjects, $commentObj);
		}else{
			die('Something went wrong adding to array');
		}
	}
	fclose($handle);
	
	$json = json_encode($commentObjects);
	
	echo $json;
	
}else{
	die('Failed to open csv file');
}


	
?>