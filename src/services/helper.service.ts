/**
* helperService
* Any function that are shared accrossed the system in sytem type could be a helper
*/
var helperService = {
  log: (item) => {
    // TODO: Create a toggle status and check here to enable or disable debug at server level
    console.log(JSON.stringify(item, null, 4));
  },

  insertItemInArray: async(originalArray, insertedItem, type, atSequence) => {
    return new Promise((resolve, reject) => {
      const arrayLength = originalArray.length;
      let newArray = [];

      if (arrayLength>0) {
        switch (type.toLowerCase()) {
          case 'before':
            for (let i=0; i < arrayLength; i++) {
              if (i !== atSequence) {
                newArray.push(originalArray[i]);
              } else {
                newArray.push(insertedItem);
                newArray.push(originalArray[i]);
              }
            }

            resolve(newArray);
            break;

          case 'after':
            for (let i=0; i < arrayLength; i++) {
              if (i !== atSequence) {
                newArray.push(originalArray[i]);
              } else {
                newArray.push(originalArray[i]);
                newArray.push(insertedItem);
              }
            }

            resolve(newArray);
            break;

          default:
            reject('Can not determine insert type');
            break;
        }
      } else {
        newArray.push(insertedItem);
        resolve(newArray);
      }

    });
  }

}

module.exports = helperService;
