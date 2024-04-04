
module.exports.CLIENT_SIDE_ONLY = typeof location !== 'undefined' ? !!location.protocol.match(/^file|https?$/) : false;

module.exports.CLICK_THROTTLE = 300;

module.exports.INIT_ENTITIES_DELAY = 500;
