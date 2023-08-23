"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlFilters } = require("../helpers/sql");

/** Related functions for companies. */

class Jobs {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle  }
   *
   
   * */

  static async create({ title, salary, equity, companyHandle}) {
    const duplicateCheck = await db.query(
          `SELECT title, company_handle
           FROM jobs
           WHERE title = $1 AND company_handle = $2`,
        [title,companyHandle]);



    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job : ${title} at company: ${companyHandle}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
        [
            title,
             salary,
              equity,
               companyHandle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle}, ...]
   * */

  static async findAll() {
    
  

    const jobsRes = await db.query(
      'SELECT title, salary, equity, company_handle FROM jobs'
          );
    return jobsRes.rows;
  }

  /** Given a companyHandle and job title, return data about job.
   *
   * Returns { title, salary, equity, company_handle }
   *   
   * Throws NotFoundError if not found.
   **/

  static async get(title, companyHandle) {
    const jobRes = await db.query(
          `SELECT title, salary, equity, company_handle 
           FROM jobs
           WHERE lower (title) = $1 AND lower (company_handle) = $2`,
        [title.toLowerCase(), companyHandle.toLowerCase()]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title} at company ${companyHandle}`);

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
                      WHERE lower (title) = ${handleVarIdx} AND lower (company_handle) = ${handleVarIdx2}
                      RETURNING title, salary, equity, company_handle  `;
    const result = await db.query(querySql, [...values, title.toLowerCase(), companyHandle.toLowerCase() ]);
    const job = result.rows[0];


    if (!job) throw new NotFoundError(`No job: ${title} at company ${companyHandle}`);

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

    if (!job) throw new NotFoundError(`Not found job $${title} for company ${company_handle}`);
  }
}


module.exports = Jobs;


