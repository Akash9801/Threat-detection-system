const { spawn } = require("child_process");
const path = require("path");

const PYTHON_PATH = "python";
const SCRIPT_PATH = path.join(__dirname, "../ml/anomaly_model.py");

function trainModel(trainingData) {
    return new Promise((resolve, reject) => {
        const process = spawn(PYTHON_PATH, [
            SCRIPT_PATH,
            "train",
            JSON.stringify(trainingData)
        ]);

        process.on("close", (code) => {
            if (code === 0) {
                resolve("Model trained");
            } else {
                reject("Training failed");
            }
        });
    });
}

function detectAnomaly(features) {
    return new Promise((resolve, reject) => {
        const process = spawn(PYTHON_PATH, [
            SCRIPT_PATH,
            "predict",
            JSON.stringify(features)
        ]);

        let result = "";

        process.stdout.on("data", (data) => {
            result += data.toString();
        });

        process.on("close", (code) => {
            if (code === 0) {
                resolve(JSON.parse(result));
            } else {
                reject("Prediction failed");
            }
        });
    });
}

module.exports = {
    trainModel,
    detectAnomaly
};
