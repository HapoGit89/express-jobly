"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin, authenticateJWT } = require("../middleware/auth");
const Jobs = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const { compare } = require("bcrypt");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle}
 *
 * Returns {  title, salary, equity, company_handle}
 *
 * Authorization required: login and admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    console.log(req.body)
    const job = await Jobs.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    // first validate whether there a additional, unwanted filters in request
    // const keys = Object.keys(req.query)
    // keys.forEach(element => {
    //   if (element != 'name' && element != "minEmployees" && element != "maxEmployees"){
    //     throw new ExpressError ("No additional filters allowed", 400)
    //   }

    // });
    // const {name, minEmployees, maxEmployees} = req.query
    // if ( minEmployees > maxEmployees){
    //   throw new ExpressError("minEmployees can't be > maxEmployees", 400)
    // }
    
    const jobs = await Jobs.findAll();
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

// /** GET /[title]/[company_handle]  =>  { job}
//  *
//  *  Job is { title, salary, equity, company_handle }
//  *   where title is [title] and company_handle is [company_handle]
//  *
//  * Authorization required: none
//  */

router.get("/:title/:company_handle", async function (req, res, next) {
  try {
    const job = await Jobs.get(req.params.title, req.params.company_handle);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[title]/[company_handle] { salary, equity, title } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity}
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: Admin
 */

router.patch("/:title/:company_handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Jobs.update(req.params.title, req.params.company_handle, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[title]/[company_handle]  =>  { deleted: title at company_handle}
 *
 * Authorization: Admin
 */

router.delete("/:title/:company_handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    await Jobs.remove(req.params.title, req.params.company_handle);
    return res.json({ deleted: {
        job: req.params.title,
        company: req.params.company_handle
    }});
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
