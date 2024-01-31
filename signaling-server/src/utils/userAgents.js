function userAgentToDevice(userAgent) {
    if (userAgent.match(/Android/i)) {
        return 'Android';
    } else if (userAgent.match(/iPhone|iPad|iPod/i)) {
        return 'iOS';
    } else if (userAgent.match(/Windows/i)) {
        return 'Windows';
    } else if (userAgent.match(/Mac OS/i)) {
        return 'Mac';
    } else if (userAgent.match(/Linux/i)) {
        return 'Linux';
    } else if (userAgent.match(/Audio/i)) {
        return 'Audio';
    } else {
        return '';
    }
}

module.exports = {
    userAgentToDevice
};

