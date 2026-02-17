const fs = require("fs");
const path = require("path");

const MODEL_PATH = path.join(__dirname, "../ml_models/model.json");

let modelData = null;

function saveModel(model) {
    fs.writeFileSync(MODEL_PATH, JSON.stringify(model));
}

function loadModel() {
    if (fs.existsSync(MODEL_PATH)) {
        const raw = fs.readFileSync(MODEL_PATH);
        modelData = JSON.parse(raw);
    }
    return modelData;
}

function getModel() {
    return modelData;
}

module.exports = {
    saveModel,
    loadModel,
    getModel
};
