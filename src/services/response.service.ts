/************************************************************************************
 *	STANDARD RESPONSE
 *
 * Response Interface
 *  Status 		(Standard http return)
 * 	Message		(Body)
 *  Data		(Body)
 *  Total		(Body)
 *
 *  OK
 *		200: Success
 * 		201: Created
 *  FAIL
 * 		400: Bad request
 * 		401: Unauthorized
 * 		403: Forbidden
 * 		404: Not found
 * 		412: Precondition failed
 * 		500: Internal Server Error
 *
 * 	HANDLER
 * 		handler_createOrSave
 * 		handler_upsert
 *  		206: Partial Content
 * 			304: Not modified
 ************************************************************************************/

import { HelperService } from './helper.service';

/************************************************************************************
 * OK
 * @function ok					200 - Status, Data | (GET)
 * @function ok_pagination		200 - Status, Data, Total | For pagination purpose only (GET)
 * @function ok_message			200 - Status, Data, Total | Partial fulfilment (POST, PATCH, DELETE)
 * @function ok_created			201 - Status, Data | (POST)
 ************************************************************************************/

module.exports.ok = function (res, result) {
	console.log('RESPONSE 200:');
	HelperService.log(result);
	var response = {
		data: result.data || {},
	};
	return res.status(200).json(response);
};

module.exports.ok_pagination = function (res, result) {
	console.log('RESPONSE 200:');
	HelperService.log(result);
	var response = {
	  data: result.data || {},
	  total: result.total || 0
	};
	return res.status(200).json(response);
};

module.exports.ok_message = function (res, result) {
	console.log('RESPONSE 200:');
	HelperService.log(result);
	var response = {
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(200).json(response);
};

module.exports.ok_created = function (res, result) {
	console.log('RESPONSE 201:');
	HelperService.log(result);
	var response = {
		data: result.data || {}
	};
	return res.status(201).json(response);
};

/************************************************************************************
 * FAIL
 * @function fail_badRequest			400 - Status, Message
 * @function fail_unauthorized			401 - Status
 * @function fail_forbidden				403 - Status
 * @function fail_notFound				404 - Status
 * @function fail_preCondition			412 - Status, Message, Data
 * @function fail_serverError			500 - Status, Message, Data
 ************************************************************************************/

 module.exports.fail_badRequest = function (res, result) {
	console.log('RESPONSE 400:');
	HelperService.log(result);
	var response = {
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
	HelperService.log(result);
	var response = {
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(412).json(response);
};

module.exports.fail_serverError = function (res, result) {
	console.log('RESPONSE 500:');
	HelperService.log(result);
	var response = {
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(500).json(response);
};

/************************************************************************************
 * HANDLER
 * @function handle_createOrSave			412 - Status, Message, Data
 * 										500 - Status, Message, Data
 * @function handle-upsert				200 - Status, Message, Data
 * 										206 - Status, Message, Data
 * 										304 - Status
 * 										412 - tatus, Message, Data
 *
 ************************************************************************************/

module.exports.handle_createOrSave = function(res, error) {
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
		var response = {
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

module.exports.handle_server_error = function(res, error) {
	const response = {
		message: error['message'] || '',
		data: error['data'] || []
	}
	console.log('RESPONSE 500:');
	HelperService.log(response);
	return res.status(500).json(response);
}

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
	HelperService.log(response);
	return res.status(412).json(response);
}

// --- DEPRECATED
module.exports.badRequest = function (res, result) {
	HelperService.log(result);
	var response = {
		code: 400,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(400).json(response);
};

module.exports.unauthorized = function (res, result) {
	HelperService.log(result);
	var response = {
		code: 401,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(401).json(response);
};

module.exports.forbidden = function (res, result) {
	HelperService.log(result);
	var response = {
		code: 403,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(403).json(response);
};

module.exports.notFound = function (res, result) {
	HelperService.log(result);
	var response = {
		code: 404,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(404).json(response);
};

module.exports.preconditionFailed = function (res, result) {
	HelperService.log(result);
	var response = {
		code: 412,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(412).json(response);
};

module.exports.serverError = function (res, result) {
	HelperService.log(result);
	var response = {
		code: result.code || 500,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(500).json(response);
};

module.exports.createOrSaveFailed = function(res, error) {
	HelperService.log(error);
	if (error.message.indexOf('duplicate key error') !== -1) {
	  const response = {
		code: 412,
		message: 'Key duplication error',
		data: error.message,
	  }
	  return res.status(412).json(response);
	} else if (error.message.indexOf('validation failed') !== -1) {
	  const response = {
		code: 412,
		message: 'Validation failed',
		data: error.message,
	  }
	  return res.status(412).json(response);
	} else if (error.code == 412) {
	  const response = {
		code: 412,
		message: 'Key duplication error or validation failed, use terminal to check details!',
		data: error.data,
	  }
	  return res.status(412).json(response);
	} else {
		var response = {
			code: error.code || 500,
			message: error.message || '',
			data: error.data || {}
		};
		return res.status(500).json(response);
	}
};
