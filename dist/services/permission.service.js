/**
* PERMISSION
*
* Tcode permission checking
* - @function hasTcode
*
* Request role checking
* - @function isRequestor
* - @function isOwner
* - @function isPIC
* - @function checkViewers
*/
/**
* Tcode permission checking
* - Check if user has corresponding tcode to perform request or not
* - This check is undertaken at each action before other step
* - Check relied on the pre-defined tcode for each action compared with tcodes in mySession
*/
// Check if document tcode is included in logged user's tcodes
module.exports.hasTcode = function (req, tcode) {
    console.log('...PERMISSION CHECKING | Checking Tcode Access!');
    return (req['mySession'].tcodes.includes(tcode));
};
/**
* Request role checking
* - Together with request status, the user role in request determine what action is possible
*/
// Check if logged user is document requestor
module.exports.isRequestor = function (req, requestor) {
    console.log('...PERMISSION CHECKING | Checking Requestor!');
    return (req['mySession'].username === requestor);
};
// Check if logged user is owner of document requestor
module.exports.isOwner = function (owners, req) {
    console.log('...PERMISSION CHECKING | Checking Owners!');
    return (owners.includes(req['mySession'].username));
};
// Check if logged user is PIC of document requestor
module.exports.isPIC = function (req, pic) {
    console.log(req['mySession'].username);
    console.log(pic);
    console.log('...PERMISSION CHECKING | Checking PIC!');
    return (req['mySession'].username === pic);
};
// Check if logged user is Viewers of document requestor
module.exports.checkViewers = function (myRequest, viewer) {
    let viewers = [...myRequest.owner, myRequest.pic, myRequest.approved, myRequest.next];
    console.log(viewers);
};
