
function typeOf(obj) {
    return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}

function isBoolean(obj) {
    return (Object.prototype.toString.call(obj) === '[object Boolean]');
}

function isString(obj) {
    return (Object.prototype.toString.call(obj) === '[object String]');
}

function isArray(obj) {
    return Array.isArray(obj);
}

function isFunction(obj) {
    return (Object.prototype.toString.call(obj) === '[object Function]');
}

function isEmpty(obj) {
    if ((obj === undefined) || (obj === null))
        return true;

    if (isString(obj) && (obj.length === 0))
        return true;

    if (isArray(obj) && (obj.length === 0))
        return true;

    return false;
}

// --------------------------------------------------------------------------------------------------------------------------------------------------

exports.typeOf = typeOf;
exports.isBoolean = isBoolean;
exports.isString = isString;
exports.isArray = isArray;
exports.isFunction = isFunction;
exports.isEmpty = isEmpty;
