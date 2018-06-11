/**
*	STANDARD RESPONSE
* To standardize the way that system could consistently respond to a user request
*
* @return
* - Status 		(Standard http return)
* - Message		(Body)
* - Data			(Body)
* - Total			(Body)
*/

const helper = require('./helper.service');

module.exports.done = (req, res) => {
	const code = req['myResult']['code'] || 500;
	const total = req['myResult']['total'] || null;

	const result = {};
	if (req['myResult']['message']) { result['message'] = req['myResult']['message']; }
	if (req['myResult']['data']) { result['data'] = req['myResult']['data']; }

	if (req['myResult']['total']) {
		result['total'] = req['myResult']['total'];
		res.status(code).send(result);
	} else {
		res.status(code).send(result);
	}
}

/**
* OK
* @function ok							200 - Status, Data | (GET)
* @function ok_pagination		200 - Status, Data, Total | For pagination purpose only (GET)
* @function ok_message			200 - Status, Data, Total | Partial fulfilment (POST, PATCH, DELETE)
* @function ok_created			201 - Status, Data | (POST)
*
* @param res
* @param result
* - message
* - data
* - total
*
* @return {gk response}
*	- 200: 			Success
* - 201: 			Created
*/

module.exports.ok = function (res, result) {
	const response = {
		data: result.data || {},
	};
	console.log('RESPONSE 200:');
	// helper.log(response);
	return res.status(200).json(response);
};

module.exports.ok_pagination = function (res, result) {
	const response = {
	  data: result.data || {},
	  total: result.total || 0
	};
	console.log('RESPONSE 200:');
	// helper.log(response);
	return res.status(200).json(response);
};

module.exports.ok_message = function (res, result) {
	const response = {
		message: result.message || '',
		data: result.data || {}
	};
	helper.log(response);
	// console.log('RESPONSE 200:');
	return res.status(200).json(response);
};

module.exports.ok_created = function (res, result) {
	const response = {
		data: result.data || {}
	};
	helper.log(response);
	console.log('RESPONSE 201:');
	return res.status(201).json(response);
};

/**
* FAIL
* @function fail_badRequest			400 - Status, Message
* @function fail_unauthorized		401 - Status
* @function fail_forbidden			403 - Status
* @function fail_notFound				404 - Status
* @function fail_preCondition		412 - Status, Message, Data
* @function fail_serverError		500 - Status, Message, Data
*
* @param res
* @param result
* - message
* - data
*
* @return {gk response}
* - 400: 			Bad request
* - 401: 			Unauthorized
* - 403: 			Forbidden
* - 404: 			Not found
* - 412: 			Precondition failed
* - 500: 			Internal Server Error
*/

 module.exports.fail_badRequest = function (res, result) {
	console.log('RESPONSE 400:');
	helper.log(result);
	const response = {
		message: result.message || '',
	};
	return res.status(400).json(response);
};

module.exports.fail_unauthorized = function (res) {
	console.log('RESPONSE 401');
	return res.status(401).send();
};

module.exports.fail_forbidden = function (res) {
	console.log('RESPONSE 403');
	return res.status(403).send();
};

module.exports.fail_notFound = function (res) {
	console.log('RESPONSE 404');
	return res.status(404).send();
};

module.exports.fail_preCondition = function (res, result) {
	console.log('RESPONSE 412:');
	helper.log(result);
	const response = {
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(412).json(response);
};

module.exports.fail_serverError = function (res, result) {
	const response = {
		message: result['message'] || '',
		data: result['data'] || []
	};
	console.log('RESPONSE 500:');
	helper.log(response);
	return res.status(500).json(response);
};

/**
* HANDLER
* @function handle_createOrSaveError
* @function handle_upsert
*
* @param res
* @param result
* - message
* - data
*
* @return {gk response}
* handle_createOrSaveError
* - 412 			Status, Message, Data
* - 500				Status, Message, Data
*
* handle_upsert
* - 200				Status, Message, Data
* - 206				Status, Message, Data				Partial Content
* - 304				Status											Not modified
* - 412				Status, Message, Data
*/

module.exports.handle_createOrSaveError = function(res, error) {
	console.log(error);
	if (error.message.indexOf('duplicate key error') !== -1) {
	  const response = {
		message: 'Key duplication error!',
		data: error.message,
	  }
	  return res.status(412).json(response);
	} else if (error.message.indexOf('validation failed') !== -1) {
	  const response = {
		message: 'Validation failed!',
		data: error.message,
	  }
	  return res.status(412).json(response);
	} else if (error.code == 412) {
	  const response = {
		message: 'Key duplication error or validation failed, use terminal to check details!',
		data: error.data,
	  }
	  return res.status(412).json(response);
	} else {
		const response = {
			message: error.message || '',
			data: error || {}
		};
		return res.status(500).json(response);
	}
};

module.exports.handle_upsert = function(res, result) {
	console.log(result);
	if (!result.data.nModified) {
		if (!result.data.nErrors) {
			return res.status(304);	// No new, no error
		} else {
			const response = {
				message: result.message || '',
				data: result.data,
			};
			return res.status(412).json(response);	// All failed
		}
	} else {
		if (!result.data.nErrors) {
			const response = {
				message: result.message || '',
				data: result.data,
			};
			return res.status(200).json(response);	// All success
		} else {
			const response = {
				message: result.message || '',
				data: result.data,
			};
			return res.status(206).json(response);	// Partial
		}
	}
};

module.exports.handle_failed_precondition = function(res, validatedResult) {
	const response = {
		message: 'Data failed validation process',
		data: {
			"n": validatedResult['error'].length + validatedResult['data'].length,
			"nModified": 0,
			"nErrors": validatedResult['error'].length,
			"errorDetails": JSON.stringify(validatedResult['error']),
		}
	}

	console.log('RESPONSE 412:');
	helper.log(response);
	return res.status(412).json(response);
}
