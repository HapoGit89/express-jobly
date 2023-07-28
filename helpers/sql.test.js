const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate }= require("./sql")
const { SECRET_KEY } = require("../config");
const { BadRequestError } = require("../expressError");

describe("create SQL for partial update", function () {
  test("works: only some fields of jstoSQL schema are given in data", function () {
    const {setCols, values }= sqlForPartialUpdate(
        {
            "numEmployees": 120
        },
        {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
          });
    expect(setCols).toEqual("\"num_employees\"=$1");
    expect(values).toEqual([120])
  
  });

  test("works not: if no data is given", function () {
          expect(() => { sqlForPartialUpdate({}, {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
          }); }).toThrow(BadRequestError);
  
  });

});
