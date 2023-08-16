"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlFilters } = require("../helpers/sql");

/** Related functions for companies. */

class Jobs {
  /** Create a job (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle  }
   *
   
   * */

  static async create({ title, salary, equity, company_handle}) {
    const duplicateCheck = await db.query(
          `SELECT title, company_handle
           FROM companies
           WHERE title = $1 AND company_handle = $2`,
        [title,company_handle]);



    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job : ${title} at company: ${company_handle}`);

    const result = await db.query(
          `INSERT INTO jobbs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4,)
           RETURNING title, salary, equity, company_handle AS "company_handle"`,
        [
            title,
             salary,
              equity,
               company_handle
        ],
    );
    const jobb = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle}, ...]
   * */

  static async findAll() {
    
  

    const jobsRes = await db.query(
      'SELECT * FROM jobs'
          );
    return jobsRes.rows;
  }

  /** Given a company handle and title, return data about job.
   *
   * Returns { title, salary, equity, company_handle }
   *   
   * Throws NotFoundError if not found.
   **/

  static async get(title, companyHandle) {
    const jobRes = await db.query(
          `SELECT title, salary, equity, company_handle AS companyHandle
           FROM jobs
           WHERE title = $1 AND company_handle = %2`,
        [title, companyHandle]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No company: ${handle}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(title, companyHandle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const handleVarIdx = "$" + (values.length + 1);
    const handleVarIdx2 = "$" + (values.length + 2);

    const querySql = `UPDATE jobs
                      SET ${setCols} 
                      WHERE title = ${handleVarIdx} AND company_handle = ${handleVarIdx2}
                      RETURNING title, salary, equity, company_handle AS companyHandle `;
    const result = await db.query(querySql, [...values, title, companyHandle ]);
    const jobbs = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title} at company ${company_handle}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(title, company_handle) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE title = $1 AND company_handle = $2
           RETURNING title`,
        [title, company_handle]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Jobs;





// More code heavy way of filtering for findAll()
//   if(name && !minEmployees && !maxEmployees){
  //     const companiesRes = await db.query(
  //       `SELECT handle,
  //               name,
  //               description,
  //               num_employees AS "numEmployees",
  //               logo_url AS "logoUrl"
  //        FROM companies
  //        WHERE lower (handle) LIKE $1
  //        ORDER BY name`, [`%${name.toLowerCase()}%`] );
  // return companiesRes.rows;
  //   }

  //   if(name && minEmployees && !maxEmployees){
  //     const companiesRes = await db.query(
  //       `SELECT handle,
  //               name,
  //               description,
  //               num_employees AS "numEmployees",
  //               logo_url AS "logoUrl"
  //        FROM companies
  //        WHERE lower (handle) LIKE $1
  //        AND num_employees > $2
  //        ORDER BY name`, [`%${name.toLowerCase()}%`, minEmployees] );
  // return companiesRes.rows;
  //   }

  //   if(name && minEmployees && maxEmployees){
  //     const companiesRes = await db.query(
  //       `SELECT handle,
  //               name,
  //               description,
  //               num_employees AS "numEmployees",
  //               logo_url AS "logoUrl"
  //        FROM companies
  //        WHERE lower (handle) LIKE $1
  //        AND num_employees > $2
  //        AND num_employees < $3
  //        ORDER BY name`, [`%${name.toLowerCase()}%`, minEmployees, maxEmployees] );
  // return companiesRes.rows;
  //   }

  //   if(name && !minEmployees && maxEmployees){
  //     const companiesRes = await db.query(
  //       `SELECT handle,
  //               name,
  //               description,
  //               num_employees AS "numEmployees",
  //               logo_url AS "logoUrl"
  //        FROM companies
  //        WHERE lower (handle) LIKE $1
  //        AND num_employees < $2
  //        ORDER BY name`, [`%${name.toLowerCase()}%`, maxEmployees] );
  // return companiesRes.rows;
  //   } 

  // if(!name && minEmployees && maxEmployees){
  //     const companiesRes = await db.query(
  //       `SELECT handle,
  //               name,
  //               description,
  //               num_employees AS "numEmployees",
  //               logo_url AS "logoUrl"
  //        FROM companies
  //        WHERE num_employees > $1
  //        AND num_employees < $2
  //        ORDER BY name`, [minEmployees, maxEmployees] );
  // return companiesRes.rows;
  //   }

  //   if(!name && !minEmployees && maxEmployees){
  //     const companiesRes = await db.query(
  //       `SELECT handle,
  //               name,
  //               description,
  //               num_employees AS "numEmployees",
  //               logo_url AS "logoUrl"
  //        FROM companies
  //        WHERE num_employees < $1
  //        ORDER BY name`, [maxEmployees] );
  // return companiesRes.rows;
  //   }

  //   if(!name && minEmployees && !maxEmployees){
  //     const companiesRes = await db.query(
  //       `SELECT handle,
  //               name,
  //               description,
  //               num_employees AS "numEmployees",
  //               logo_url AS "logoUrl"
  //        FROM companies
  //        WHERE num_employees > $1
  //        ORDER BY name`, [minEmployees] );
  // return companiesRes.rows;
  //   }
