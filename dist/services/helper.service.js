var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
* helperService
* Any function that are shared accrossed the system in sytem type could be a helper
*/
var helperService = {
    log: (item) => {
        // TODO: Create a toggle status and check here to enable or disable debug at server level
        console.log(JSON.stringify(item, null, 4));
    },
    insertItemInArray: (originalArray, insertedItem, type, atSequence) => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const arrayLength = originalArray.length;
            let newArray = [];
            if (arrayLength > 0) {
                switch (type.toLowerCase()) {
                    case 'before':
                        for (let i = 0; i < arrayLength; i++) {
                            if (i !== atSequence) {
                                newArray.push(originalArray[i]);
                            }
                            else {
                                newArray.push(insertedItem);
                                newArray.push(originalArray[i]);
                            }
                        }
                        resolve(newArray);
                        break;
                    case 'after':
                        for (let i = 0; i < arrayLength; i++) {
                            if (i !== atSequence) {
                                newArray.push(originalArray[i]);
                            }
                            else {
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
            }
            else {
                newArray.push(insertedItem);
                resolve(newArray);
            }
        });
    }),
    extractHashtag(words) {
        return words.match(/@\S+/g);
    },
    /**
    * @function compare
    * Sort array of objects
    *
    * @param {array} a
    * @param {array} b
    * @param prop
    */
    compare1(a, b, prop) {
        if (a[prop] < b[prop]) {
            return -1;
        }
        if (a[prop] > b[prop]) {
            return 1;
        }
        return 0;
    },
    /**
    * @function operation
    * Array of object difference math based on unique ID
    *
    * @param {array} list1
    * @param {array} list2
    * @param {boolean} isUnion
    */
    operation(list1, list2, isUnion) {
        return list1.filter(a => isUnion === list2.some(b => a === b));
    },
    /**
    * @function inBoth
    * Return an array that contains elements in both list1 and list2
    *
    * @param {array} list1
    * @param {array} list2
    *
    * @return {array}
    */
    inBoth(list1, list2) {
        return this.operation(list1, list2, true);
    },
    /**
    * @function inFirstOnly
    * Return an array that contains elements in list1 and NOT in list2
    *
    * @param list1
    * @param list2
    *
    * @return {array}
    */
    inFirstOnly(list1, list2) {
        return this.operation(list1, list2, false);
    },
    /**
    * @function inSecondOnly
    * Return an array that contains elements in list2 and NOT in list1
    *
    * @param list1
    * @param list2
    *
    * @return {array}
    */
    inSecondOnly(list1, list2) {
        return this.inFirstOnly(list2, list1);
    },
    // diff(arr1, arr2) {
    //   return arr1.filter(item => arr2.indexOf(item) < 0);
    // },
    //
    // inLeftOnly(arr1, arr2) {
    //   return helperService.diff(arr1, arr2);
    // },
    //
    // inRightOnly(arr1, arr2) {
    //   return helperService.diff(arr2, arr1);
    // },
    // https://gomakethings.com/check-if-two-arrays-or-objects-are-equal-with-javascript/
    isEqual(value, other) {
        // Get the value type
        var type = Object.prototype.toString.call(value);
        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(other))
            return false;
        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(type) < 0)
            return false;
        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen)
            return false;
        // Compare two items
        var compare = function (item1, item2) {
            // Get the object type
            var itemType = Object.prototype.toString.call(item1);
            // If an object or array, compare recursively
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!helperService.isEqual(item1, item2))
                    return false;
            }
            else {
                // If the two items are not the same type, return false
                if (itemType !== Object.prototype.toString.call(item2))
                    return false;
                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString())
                        return false;
                }
                else {
                    if (item1 !== item2)
                        return false;
                }
            }
        };
        // Compare properties
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (compare(value[i], other[i]) === false)
                    return false;
            }
        }
        else {
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    if (compare(value[key], other[key]) === false)
                        return false;
                }
            }
        }
        // If nothing failed, return true
        return true;
    },
};
module.exports = helperService;
