import React from "react";
import Papa from "papaparse";

// Component for uploading a file and parsing its contents
const FileUpload = ({ onDataParsed }) => {
  // Validates if the CSV file contains the required columns
  const validateCSVColumns = (headers) => {
    const requiredColumns = ["sales_date", "product_description", "quantity_sold"];
    const normalizedHeaders = headers.map(header => header.trim().toLowerCase()); // Trim spaces and convert to lowercase
    for (let col of requiredColumns) {
      if (!normalizedHeaders.includes(col)) {
        return false; // Missing required column
      }
    }
    return true;
  };

  // Handles the file upload and parses the CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (!file) {
      alert("Please select a file!");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      alert("Only CSV files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result; // Get file content

      console.log("Raw File Content:", fileContent); // Log the raw content for debugging

      // Parse the CSV file using PapaParse
      Papa.parse(fileContent, {
        header: true, // Treat the first row as the header
        skipEmptyLines: true, // Ignore empty lines
        delimiter: ",", // Force the delimiter to be a comma
        complete: (results) => {
          if (results.errors.length > 0) {
            alert("Error parsing the file. Please check the format.");
            console.error("Error parsing the file:", results.errors); // Handle parsing errors
            return;
          }

          // Validate CSV columns before proceeding
          if (!validateCSVColumns(results.meta.fields)) {
            alert("CSV file is missing required columns: sales_date, product_description, quantity_sold.");
            return;
          }

          console.log("Parsed Data:", results.data); // Log parsed data for debugging
          onDataParsed(results.data); // Pass parsed data to the parent component
        },
        error: (error) => {
          alert("Error processing the file. Please try again.");
          console.error("File upload error:", error);
        },
      });
    };

    reader.onerror = (error) => {
      alert("Error reading the file. Please try again.");
      console.error("Error reading file:", error);
    };

    reader.readAsText(file); // Read the file as text
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <label htmlFor="file-upload" style={{ cursor: "pointer", marginBottom: "10px" }}>
        <strong>Upload CSV File</strong>
      </label>
      <br />
      <input
        id="file-upload"
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ marginTop: "10px" }}
      />
    </div>
  );
};

export default FileUpload;
