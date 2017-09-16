var generatePassword = require("password-generator");

class randomPassword {
  maxLength = 18;
  minLength = 12;
  uppercaseMinCount = 3;
  lowercaseMinCount = 3;
  numberMinCount = 2;
  specialMinCount = 2;
  UPPERCASE_RE = /([A-Z])/g;
  LOWERCASE_RE = /([a-z])/g;
  NUMBER_RE = /([\d])/g;
  SPECIAL_CHAR_RE = /([\?\-])/g;
  NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

  isStrongEnough(password) {
    const uc = password.match(this.UPPERCASE_RE);
    const lc = password.match(this.LOWERCASE_RE);
    const n = password.match(this.NUMBER_RE);
    const sc = password.match(this.SPECIAL_CHAR_RE);
    const nr = password.match(this.NON_REPEATING_CHAR_RE);
    return password.length >= this.minLength &&
      !nr &&
      uc && uc.length >= this.uppercaseMinCount &&
      lc && lc.length >= this.lowercaseMinCount &&
      n && n.length >= this.numberMinCount &&
      sc && sc.length >= this.specialMinCount;
  }

  generate() {
    let password = "";
    const randomLength = Math.floor(Math.random() * (this.maxLength - this.minLength)) + this.minLength;
    while (!this.isStrongEnough(password)) {
      password = generatePassword(randomLength, false, /[\w\d\?\-]/);
    }
    return password;
  }

}

export = randomPassword;
