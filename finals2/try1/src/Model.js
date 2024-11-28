import * as tf from "@tensorflow/tfjs";

// Normalize the sales_date
function normalizeData(data) {
  const minDate = Math.min(...data.map((row) => row.sales_date));
  const maxDate = Math.max(...data.map((row) => row.sales_date));

  return data.map((row) => ({
    ...row,
    sales_date: (row.sales_date - minDate) / (maxDate - minDate),
  }));
}

// One-hot encode product_description (assumes the product descriptions are categorical)
function encodeProductDescriptions(data) {
  const productDescriptions = [...new Set(data.map((row) => row.product_description))];
  const encodedData = data.map((row) => {
    const encoding = Array(productDescriptions.length).fill(0);
    const index = productDescriptions.indexOf(row.product_description);
    encoding[index] = 1;
    return { ...row, product_description: encoding };
  });

  return encodedData;
}

// Create a simple model for prediction
export function createModel() {
  const model = tf.sequential();

  model.add(tf.layers.dense({ inputShape: [2], units: 10, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "linear" }));

  model.compile({ optimizer: "adam", loss: "meanSquaredError" });
  return model;
}

// Train the model
export async function trainModel(model, inputTensor, outputTensor) {
  await model.fit(inputTensor, outputTensor, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    shuffle: true,
  });
}

// Make predictions using the trained model
export function predictSales(model, inputData) {
  const inputTensor = tf.tensor2d(inputData);
  const predictions = model.predict(inputTensor);
  return predictions.arraySync();
}
