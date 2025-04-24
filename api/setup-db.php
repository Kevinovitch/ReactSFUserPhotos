<?php
// setup-db.php

// Configuring the connection using environment variables
$host = getenv('MYSQLHOST') ?: 'mysql.railway.internal';
$port = getenv('MYSQLPORT') ?: '3306';
$database = getenv('MYSQLDATABASE') ?: 'railway';
$username = getenv('MYSQLUSER') ?: 'root';
$password = getenv('MYSQLPASSWORD') ?: '';

try {
    // Attempting to connect directly to PDO
    $dsn = "mysql:host=$host;port=$port;dbname=$database";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Successful connection to the database!\n";

    // Read the schema file
    $schemaFile = __DIR__ . '/schema.sql';
    if (file_exists($schemaFile)) {
        $sql = file_get_contents($schemaFile);

        // Separate requests (generally separated by semicolons)
        $queries = explode(';', $sql);

        // Execute each request
        foreach ($queries as $query) {
            $query = trim($query);
            if (!empty($query)) {
                $pdo->exec($query);
                echo "Successful execution: " . substr($query, 0, 50) . "...\n";
            }
        }

        echo "Schema successfully imported!\n";
    } else {
        echo "Schema file not found: $schemaFile\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    // Do not quit, let the application start anyway
}