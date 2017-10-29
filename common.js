
/* class QString extends String {
    isEmpty() {
        return this.length === 0;
    }
} */

class QStack extends Array {
    // push
    // pop

    get top() {
        return this[this.length - 1];
    }

    set top(value) {
        this[this.length - 1] = value;
    }

    isEmpty() {
        return this.length === 0;
    }
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// -------------------------------------------------------------------------------------------------

module.exports = {
//    QString: QString,
    QStack: QStack,

    isNumeric: isNumeric
};
