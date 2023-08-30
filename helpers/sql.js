const { BadRequestError } = require("../expressError");

// converts incoming JS Data to SQL query
// where dataToUpdate is incoming Data an jsToSql is data schema for conversion from JS data to SQL data
// This function enables any kind of data structure to be used in SQL update

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}
// This function builds a query String and SQL parameter array from incoming filters for the companies table
function sqlFilters(name, minEmployees, maxEmployees) {

    let baseQuery = `
      SELECT handle,
          name,
          description,
          num_employees AS "numEmployees",
          logo_url AS "logoUrl"
      FROM companies
      `

      const variables = []
      let filterKeyword = "WHERE"
      if(name) {
        variables.push(`%${name.toLowerCase()}%`)
        const nameQ = ` ${filterKeyword} lower (handle) LIKE $${variables.length}`
        baseQuery += nameQ
        filterKeyword = "AND"
      }

      if (minEmployees) {
        variables.push(minEmployees)

        const minQ = ` ${filterKeyword} num_employees >= $${variables.length}`
        baseQuery += minQ
        filterKeyword = "AND"
      }

       if (maxEmployees) {
        variables.push(maxEmployees)

        const maxQ = ` ${filterKeyword} num_employees <= $${variables.length}`
        baseQuery += maxQ
      }

      baseQuery+= " ORDER BY name"


      
      return {baseQuery, variables}
  }


  // This function builds a query String and SQL parameter array from incoming filters for the jobs table
  function sqlFiltersJobs(title, minSalary, hasEquity) {

    let baseQuery = `
      SELECT title,
          salary,
          equity,
          company_handle          
      FROM jobs
      `

      const variables = []
      let filterKeyword = "WHERE"
      if(title) {
        variables.push(`%${title.toLowerCase()}%`)
        const titleQ = ` ${filterKeyword} lower (title) LIKE $${variables.length}`
        baseQuery += titleQ
        filterKeyword = "AND"
      }

      if (minSalary) {
        variables.push(minSalary)
        const SalaryQ = ` ${filterKeyword} salary >= $${variables.length}`
        baseQuery += SalaryQ
        filterKeyword = "AND"
      }
      if (hasEquity){

       if (hasEquity.toLowerCase()=="true") {
        console.log("has equiktry")
        const hasEquityQ = ` ${filterKeyword} equity > 0.00`
        baseQuery += hasEquityQ
        filterKeyword = "AND"
      }

      if (hasEquity.toLowerCase()=="false") {
        const hasNoEquityQ = ` ${filterKeyword} equity <= 0.00`
        baseQuery += hasNoEquityQ
      }
    }

      baseQuery+= " ORDER BY title"


      
      return {baseQuery, variables}
  }




module.exports = { sqlForPartialUpdate, sqlFiltersJobs,
sqlFilters };
