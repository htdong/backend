var helperService = {
  log: (item) => {
    console.log(JSON.stringify(item, null, 4));
  }
}

module.exports = helperService;

// export class HelperService {
//   constructor() {
//   }
//
//   static log(item) {
//     console.log(JSON.stringify(item, null, 4));
//   }
//
// }
