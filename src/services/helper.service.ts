/**
* helperService
* Any function that are shared accrossed the system in sytem type could be a helper
*/
var helperService = {
  log: (item) => {
    // TODO: Create a toggle status and check here to enable or disable debug at server level
    console.log(JSON.stringify(item, null, 4));
  }
}

module.exports = helperService;
