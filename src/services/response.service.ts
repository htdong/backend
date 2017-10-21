module.exports.ok = function (res, result) {
	var response = {
		code: 200,
		message: result.message || 'Operation is successfully executed',
		data: result.data || {},
		total: result.total || 0
	};
	return res.status(200).json(response);
};

module.exports.created = function (res, result) {
	var response = {
		code: 201,
		message: result.message || 'The request has been fulfilled and resulted in a new resource being created',
		data: result.data || {}
	};
	return res.status(201).json(response);
};

module.exports.badRequest = function (res, result) {
	var response = {
		code: 400,
		message: result.message || 'The request cannot be fulfilled due to bad syntax',
		data: result.data || {}
	};
	return res.status(400).json(response);
};

module.exports.unauthorized = function (res, result) {
	var response = {
		code: 401,
		message: result.message || 'User not authorized to perform the operation',
		data: result.data || {}
	};
	return res.status(401).json(response);
};

module.exports.forbidden = function (res, result) {
	var response = {
		code: 403,
		message: result.message || 'User privileges is not sufficient to access forbidden resource',
		data: result.data || {}
	};
	return res.status(403).json(response);
};

module.exports.notFound = function (res, result) {
	var response = {
		code: 404,
		message: result.message || 'The requested resource could not be found but may be available again in the future',
		data: result.data || {}
	};
	return res.status(404).json(response);
};

module.exports.preconditionFailed = function (res, result) {
	var response = {
		code: 412,
		message: result.message || 'Precondition or validation falied',
		data: result.data || {}
	};
	return res.status(412).json(response);
};

module.exports.serverError = function (res, result) {
	var response = {
		code: result.code || 500,
		message: result.message || 'Something bad happened on the server',
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
	} else {
		var response = {
			code: error.code || 500,
			message: error.message || 'Something bad happened on the server',
			data: error.data || {}
		};
		return res.status(500).json(response);		
	}	
}
