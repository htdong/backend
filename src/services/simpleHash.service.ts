/*
var SimpleHash = {
  encode: (str) => {
    //Buffer() requires a number, array or string as the first parameter, and an optional encoding type as the second parameter.
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
      return this.encode(elem);
    });
  },
  decode_array: (arr) => {
    return arr.map((elem, index, arr) => {
      return this.decode(elem);
    });
  }


}
module.exports = SimpleHash;
*/

export class SimpleHash {
  constructor() {
  }

  static encode(str: string): string {
    //Buffer() requires a number, array or string as the first parameter, and an optional encoding type as the second parameter.
    // Default is utf8, possible encoding types are ascii, utf8, ucs2, base64, binary, and hex
    const sh = new Buffer(str);

    // If we don't use toString(), JavaScript assumes we want to convert the object to utf8.
    // We can make it convert to other formats by passing the encoding type to toString().
    return sh.toString('base64');
  }

  static decode(str: string): string {
    const sh = new Buffer(str, 'base64')
    return sh.toString();
  }

  static encode_array(arr: Array<string>): Array<string> {
    return arr.map((elem, index, arr) => {
      return this.encode(elem);
    });
  }

  static decode_array(arr: Array<string>): Array<string> {
    return arr.map((elem, index, arr) => {
      return this.decode(elem);
    });
  }

}
