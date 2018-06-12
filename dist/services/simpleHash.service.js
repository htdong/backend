/**
* simpleHash
* The simple algorithm to encode and decode a string or array of strings
*
* @function enconde
* @function decode
* @function encode_array
* @function decode_array
*/
var simpleHash = {
    encode: (str) => {
        // Buffer() requires a number, array or string as the first parameter,
        // and an optional encoding type as the second parameter.
        // Default is utf8, possible encoding types are ascii, utf8, ucs2, base64, binary, and hex
        const sh = new Buffer(str);
        // If we don't use toString(), JavaScript assumes we want to convert the object to utf8.
        // We can make it convert to other formats by passing the encoding type to toString().
        return sh.toString('base64');
    },
    decode: (str) => {
        const sh = new Buffer(str, 'base64');
        return sh.toString();
    },
    encode_array: (arr) => {
        return arr.map((elem, index, arr) => {
            return simpleHash.encode(elem);
        });
    },
    decode_array: (arr) => {
        return arr.map((elem, index, arr) => {
            return simpleHash.decode(elem);
        });
    }
};
module.exports = simpleHash;
