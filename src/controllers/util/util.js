const handle = (promise) => {
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]));
}

const escapeRegex = function (text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports.handle = handle;
module.exports.escapeRegex = this.escapeRegex
