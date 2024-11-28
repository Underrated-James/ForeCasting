import * as tf from '@tensorflow/tfjs';

// Create the model
export const createModel = () => {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [2] }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
  });

  return model;
};

// Train the model
export const trainModel = async (model, inputs, outputs) => {
  const inputTensor = tf.tensor(inputs, [inputs.length, 2], 'float32'); // Ensure input tensor is of shape [samples, features]
  const outputTensor = tf.tensor(outputs, [outputs.length, 1], 'float32'); // Ensure output tensor is a column vector

  // Train the model
  await model.fit(inputTensor, outputTensor, {
    epochs: 100,
  });

  return model;
};

// Make predictions
export const predictSales = (model, inputs) => {
  const inputTensor = tf.tensor(inputs, [inputs.length, 2], 'float32');
  return model.predict(inputTensor).dataSync(); // Convert the tensor output to a JS array
};
