"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin, authenticateJWT } = require("../middleware/auth");
const Jobs = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

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

// /** GET /  =>
//  *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
//  *
//  * Can filter on provided search filters:
//  * - minEmployees
//  * - maxEmployees
//  * - nameLike (will find case-insensitive, partial matches)
//  *
//  * Authorization required: none
//  */

// router.get("/", async function (req, res, next) {
//   try {
//     // first validate whether there a additional, unwanted filters in request
//     const keys = Object.keys(req.query)
//     keys.forEach(element => {
//       if (element != 'name' && element != "minEmployees" && element != "maxEmployees"){
//         throw new ExpressError ("No additional filters allowed", 400)
//       }

//     });
//     const {name, minEmployees, maxEmployees} = req.query
//     if ( minEmployees > maxEmployees){
//       throw new ExpressError("minEmployees can't be > maxEmployees", 400)
//     }
//     const companies = await Company.findAll(name, minEmployees, maxEmployees);
//     return res.json({ companies });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** GET /[handle]  =>  { company }
//  *
//  *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
//  *   where jobs is [{ id, title, salary, equity }, ...]
//  *
//  * Authorization required: none
//  */

// router.get("/:handle", async function (req, res, next) {
//   try {
//     const company = await Company.get(req.params.handle);
//     return res.json({ company });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** PATCH /[handle] { fld1, fld2, ... } => { company }
//  *
//  * Patches company data.
//  *
//  * fields can be: { name, description, numEmployees, logo_url }
//  *
//  * Returns { handle, name, description, numEmployees, logo_url }
//  *
//  * Authorization required: login
//  */

// router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, companyUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const company = await Company.update(req.params.handle, req.body);
//     return res.json({ company });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** DELETE /[handle]  =>  { deleted: handle }
//  *
//  * Authorization: login
//  */

// router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
//   try {
//     await Company.remove(req.params.handle);
//     return res.json({ deleted: req.params.handle });
//   } catch (err) {
//     return next(err);
//   }
// });


module.exports = router;
