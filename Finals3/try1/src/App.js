import React, { useState } from "react";
import FileUpload from "./FileUpload";
import { preprocessData } from "./Preprocessing";
import { createModel, trainModel, predictSales } from "./Model";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from 'chart.js/auto'; // For visualization
import * as tf from '@tensorflow/tfjs';

function App() {
  const [processedData, setProcessedData] = useState(null);
  const [model, setModel] = useState(null); // Track the trained model
  const [predictions, setPredictions] = useState([]); // Track predictions
  const [actualData, setActualData] = useState([]); // Track actual sales data

  // Handle file data and preprocess it
  const handleFileProcessed = (rawData) => {
    // Ensure the CSV has the required columns: sales_date, product_description, quantity_sold
    if (!rawData[0] || !rawData[0].sales_date || !rawData[0].product_description || !rawData[0].quantity_sold) {
      console.error("CSV file is missing required columns");
      return;
    }

    const data = preprocessData(rawData);
    setProcessedData(data);

    // Set actual data for chart (sales_date, quantity_sold)
    setActualData(data.map((row) => ({
      x: row.sales_date,
      y: row.quantity_sold
    })));

    console.log("Processed Data:", data); // Debugging log
  };

  // Train the model
  const handleTrainModel = async () => {
    if (!processedData || processedData.length === 0) {
      console.error("No processed data available");
      return;
    }

    const input = processedData.map((row) => {
      if (row.sales_date === undefined || row.product_description === undefined) {
        console.error("Invalid row data:", row);
        return null; // Invalid row, skipping
      }
      return [row.sales_date, row.product_description]; // Use sales_date and product_description as inputs
    }).filter(row => row !== null); // Remove any null rows

    const output = processedData.map((row) => row.quantity_sold).filter((quantity) => quantity !== undefined); // Filter out undefined quantities

    if (input.length === 0 || output.length === 0) {
      console.error("No valid input or output data available");
      return;
    }

    const inputTensor = tf.tensor2d(input, [input.length, input[0].length]); // 2D tensor for input
    const outputTensor = tf.tensor2d(output, [output.length, 1]); // 2D tensor for output

    const trainedModel = createModel(); // Create the model
    await trainModel(trainedModel, inputTensor, outputTensor); // Train the model with data
    setModel(trainedModel); // Set the trained model in the state
    console.log("Model trained successfully!");
  };

  // Forecast sales for the next 6 months
  const handleForecastSales = () => {
    if (!model) {
      console.error("Model is not trained yet");
      return;
    }

    // Prepare the forecast input data (based on example input)
    const forecastInputs = [
      [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], // Example input for Product A
      [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], // Example input for Product B
    ];

    const forecastResults = predictSales(model, forecastInputs); // Get predicted sales
    setPredictions(forecastResults); // Update predictions in state
  };

  // Chart.js data for visualization
  const chartData = {
    labels: processedData ? processedData.map((row) => row.sales_date) : [], // Sales dates for X-axis
    datasets: [
      {
        label: 'Actual Sales',
        data: actualData.map((data) => data.y), // Actual sales data (y-values)
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Predicted Sales',
        data: predictions.length > 0 ? predictions : [], // Predicted sales data (y-values), empty if no predictions
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h1>Sales Forecasting</h1>
      <FileUpload onDataParsed={handleFileProcessed} /> {/* File upload component */}
      
      {/* Buttons for training and forecasting */}
      <button onClick={handleTrainModel} disabled={!processedData}>
        Train Model
      </button>
      <button onClick={handleForecastSales} disabled={!model}>
        Forecast Sales
      </button>

      {/* Chart for displaying actual and predicted sales */}
      {predictions.length > 0 && (
        <div>
          <h2>Forecasted Sales</h2>
          <Line data={chartData} /> {/* Display the chart */}
        </div>
      )}
    </div>
  );
}

export default App;