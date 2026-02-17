const Log = require("../models/Log");

async function simulateLateNightDataTheft(userId) {
    const attackLog = new Log({
        userId: userId,
        loginHour: 3, // fixed abnormal hour
        filesAccessed: 120, // unusually high
        dataDownloadedMB: 850, // spike
        ipAddress: "203.190.44.11", // new suspicious IP
        deviceId: "UNKNOWN_DEVICE_X"
    });

    await attackLog.save();
    return attackLog;
}

async function simulateCredentialMisuse(userId) {
    const attackLog = new Log({
        userId: userId,
        loginHour: 2,
        filesAccessed: 10,
        dataDownloadedMB: 50,
        ipAddress: "182.75.33.210",
        deviceId: "NEW_DEVICE_Z"
    });

    await attackLog.save();
    return attackLog;
}

async function simulateMassFileAccess(userId) {
    const attackLog = new Log({
        userId: userId,
        loginHour: 14,
        filesAccessed: 300,
        dataDownloadedMB: 1200,
        ipAddress: "103.28.77.90",
        deviceId: "DEV883"
    });

    await attackLog.save();
    return attackLog;
}

module.exports = {
    simulateLateNightDataTheft,
    simulateCredentialMisuse,
    simulateMassFileAccess
};
