const fs = require('fs-extra');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'cache', 'data', 'hitler.json');

function load() {
    try {
        fs.ensureDirSync(path.dirname(dataFile));
        if (!fs.existsSync(dataFile)) {
            fs.writeFileSync(dataFile, '{}', 'utf-8');
            return {};
        }
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        return (typeof data === 'object' && !Array.isArray(data)) ? data : {};
    } catch(e) {
        return {};
    }
}

function save(data) {
    try {
        fs.ensureDirSync(path.dirname(dataFile));
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch(e) {}
}

function getSection(section) {
    const data = load();
    return data[section] || {};
}

function setSection(section, sectionData) {
    const data = load();
    data[section] = sectionData;
    save(data);
}

function enableForThread(section, threadID) {
    const data = load();
    if (!data[section]) data[section] = {};
    data[section][threadID] = true;
    save(data);
}

function disableForThread(section, threadID) {
    const data = load();
    if (data[section]) delete data[section][threadID];
    save(data);
}

function isEnabled(section, threadID) {
    const data = load();
    return !!(data[section] && data[section][threadID]);
}

function getAllEnabled(section) {
    const data = load();
    if (!data[section]) return [];
    return Object.keys(data[section]).filter(tid => data[section][tid] === true);
}

module.exports = { load, save, getSection, setSection, enableForThread, disableForThread, isEnabled, getAllEnabled };
