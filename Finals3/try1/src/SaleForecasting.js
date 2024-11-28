import React, { useState, useEffect } from "react";
import { preprocessData } from "../components/Preprocessing";
import { createModel, trainModel, predictSales } from "../utils/tensorflowModel";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto"; // Import Chart.js

const SalesForecasting = ({ data }) => {
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isTraining, setIsTraining] = useState(false);

  // Preprocess data
  const processedData = preprocessData(data);

  // Extract inputs and outputs for model training
  const inputs = processedData.map(item => [
    item.sales_date, // Already converted to timestamp in preprocessing
    ...item.product_description, // Flattened one-hot encoded product description
  ]);
  const outputs = processedData.map(item => item.quantity_sold);

  // Create and train the model
  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      const newModel = createModel();
      await trainModel(newModel, inputs, outputs);
      setModel(newModel);
      console.log("Model trained successfully.");
    } catch (error) {
      console.error("Error training the model:", error);
    }
    setIsTraining(false);
  };

  // Make predictions for the next 6 months
  const handleForecast = () => {
    if (!model) {
      console.warn("Model is not trained yet. Please train the model first.");
      return;
    }

    const futureInputs = Array.from({ length: 6 }, (_, index) => {
      const lastSalesDate = new Date(processedData[processedData.length - 1].sales_date);
      const futureDate = new Date(lastSalesDate);
      futureDate.setMonth(lastSalesDate.getMonth() + index + 1);
      return [
        futureDate.getTime(),
        ...processedData[0].product_description, // Use first product description for simplicity
      ];
    });

    const forecastResults = predictSales(model, futureInputs);
    console.log("Forecast Results:", forecastResults);

    setPredictions(forecastResults || []);
  };

  // Chart.js data for visualization
  const labels = processedData.map(item => {
    const date = new Date(item.sales_date);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  });

  const chartData = {
    labels: [...labels, ...Array.from({ length: 6 }, (_, i) => `Future-${i + 1}`)],
    datasets: [
      {
        label: "Actual Sales",
        data: processedData.map(item => item.quantity_sold),
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.1,
      },
      {
        label: "Predicted Sales",
        data: [
          ...new Array(processedData.length).fill(null), // Leave space for actual data
          ...predictions,
        ],
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
        borderDash: [5, 5],
      },
    ],
  };

  return (
    <div>
      <button onClick={handleTrainModel} disabled={isTraining}>
        {isTraining ? "Training..." : "Train Model"}
      </button>
      <button onClick={handleForecast}>Forecast Sales</button>
      <div>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default SalesForecasting;
