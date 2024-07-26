<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "events_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT name, date, holiday FROM events";
$result = $conn->query($sql);

$events = array();
if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $events[] = $row;
  }
}

$conn->close();

echo json_encode($events);
?>
