/**
* RULES:
* - Population sit before the element
* - Session data before requesto document data
*/

// Check if document tcode is included in logged user's tcodes
module.exports.hasTcode = function (req, tcode) {
	console.log('...SECURITY | Checking Tcode Access!');
	return (req['mySession'].tcodes.includes(tcode));
};

// Check if logged user is document requestor
module.exports.isRequestor = function (req, requestor) {
	console.log('...SECURITY | Checking Requestor!');
	return (req['mySession'].username === requestor);
};

// Check if logged user is owner of document requestor
module.exports.isOwner = function (owners, req) {
	console.log('...SECURITY | Checking Owners!');
	return (owners.includes(req['mySession'].username));
};

// Check if logged user is PIC of document requestor
module.exports.isPIC = function (req, pic) {
	console.log(req['mySession'].username);
	console.log(pic);
	console.log('...SECURITY | Checking PIC!');
	return (req['mySession'].username === pic);
};

// Check if logged user is Viewers of document requestor
module.exports.checkViewers = function (myRequest, viewer) {
	let viewers = [...myRequest.owner, myRequest.pic, myRequest.approved, myRequest.next];
	console.log(viewers);
};
