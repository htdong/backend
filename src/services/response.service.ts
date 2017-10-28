/*	RESPONSE
 * 
 * Response Interface
 *  Code
 * 	Message
 *  Data
 *  Total
 * 
 *	200: Success
 * 	201: Created
 *  206: Partial Content
 * 	304: Not modified
 * 	400: Bad request
 * 	401: Unauthorized
 * 	403: Forbidden
 * 	404: Not found		
 * 	412: Precondition failed
 * 	500: Internal Server Error
 *  
 */

module.exports.ok = function (res, result) {
	console.log(result);	
	var response = {
		code: 200,
		message: result.message || '',
		data: result.data || {},
		total: result.total || 0
	};
	return res.status(200).json(response);
};

module.exports.created = function (res, result) {
	console.log(result);	
	var response = {
		code: 201,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(201).json(response);
};

module.exports.badRequest = function (res, result) {
	console.log(result);	
	var response = {
		code: 400,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(400).json(response);
};

module.exports.unauthorized = function (res, result) {
	console.log(result);	
	var response = {
		code: 401,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(401).json(response);
};

module.exports.forbidden = function (res, result) {
	console.log(result);	
	var response = {
		code: 403,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(403).json(response);
};

module.exports.notFound = function (res, result) {
	console.log(result);	
	var response = {
		code: 404,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(404).json(response);
};

module.exports.preconditionFailed = function (res, result) {
	console.log(result);	
	var response = {
		code: 412,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(412).json(response);
};

module.exports.serverError = function (res, result) {
	console.log(result);	
	var response = {
		code: result.code || 500,
		message: result.message || '',
		data: result.data || {}
	};
	return res.status(500).json(response);
};

module.exports.createOrSaveFailed = function(res, error) {
	console.log(error);
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

module.exports.upsertHandler = function(res, result) {
	console.log(result);
	if (!result.data.created) {
		if (!result.data.errors) {
			return res.status(304).json({});	// No new, no error
		} else {
			var response = {
				code: 412,
				message: result.message || '',
				data: result.data,
			};
			return res.status(412).json(response);	// All failed
		}
	} else {
		if (!result.data.errors) {
			var response = {
				code: 201,
				message: result.message || '',
				data: result.data,
			};
			return res.status(201).json(response);	// All success
		} else {
			var response = {
				code: 206,
				message: result.message || '',
				data: result.data,
			};
			return res.status(206).json(response);	// Partial
		}
	}				
};