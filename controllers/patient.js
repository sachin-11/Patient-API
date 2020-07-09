const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Patient = require('../models/Patient');

//@desc Get All patient
//@route GET /api/v1/patient
//@access public

exports.getPatients = asyncHandler(async (req, res, next) => {
  let query;
  //copy req.query
  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit']

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);


  let queryStr = JSON.stringify(reqQuery)
  queryStr = queryStr.replace( /\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
  query = Patient.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
   const total = await Patient.countDocuments();


  const patient  = await query;

  //Pagination results
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  
  next();
   
  res.status(200).json({ success: true, pagination, data: patient });
});

//@desc Get single patient
//@route GET /api/v1/patient/:id
//@access public

exports.getPatient = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id).populate({
    path: 'user',
    select: 'name role',
  });

  if (!patient) {
    return next(new ErrorResponse(`No patient with id ${req.params.id}`), 404);
  }

  res.status(200).json({ success: true, data: patient });
});

//@desc create patient
//@route POST  /api/v1/patient
//@access Private

exports.createPatient = asyncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;
  //Check for patient
  const publishedPatient = await Patient.findOne({ user: req.user.id });
  //if user is not an admin , they can add one patient
  if (publishedPatient && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already publish posts`,
        400
      )
    );
  }
  const patient = await Patient.create(req.body);
  res.status(200).json({ success: true, data: patient });
});

//desc  update patient
//@route GET /api/v1/patient/:id
//@access Private

exports.updatePatient = asyncHandler(async (req, res, next) => {
  let patient = await Patient.findById(req.params.id);
  if (!patient) {
    return next(
      new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is patient owner
  if (patient.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update patient`,
        401
      )
    );
  }

  patient = await Patient.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: patient });
});


//desc  delete patient
//@route GET /api/v1/patient/:id
//@access Private

exports.deletePatient = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    return next(
      new ErrorResponse(`patient not found with id of ${req.params.id}`, 404)
    );
  }

  //Make sure user is patient owner
  if (patient.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this patient`,
        401
      )
    );
  }
  patient.remove();
  res.status(200).json({ success: true, data: {} });
});