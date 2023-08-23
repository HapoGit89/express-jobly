"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Jobs = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 30000,
    equity: '0.25',
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Jobs.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
        {
            title: "new",
            salary: 30000,
            equity: '0.25',
            companyHandle: "c1",
          }
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Jobs.create(newJob);
      await Jobs.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Jobs.findAll();
    expect(jobs).toEqual([
      
        {
            title: "job1",
            salary: 30000,
            equity: '0.5',
            company_handle: "c1",
          },
          {
            title: "job2",
            salary: 30000,
            equity: '0.9',
            company_handle: "c2",
          }
    ]);
  });
//   test("works: name filter", async function () {
//     let companies1 = await Company.findAll('c4', undefined, undefined);
//     let companies2 = await Company.findAll('c2', undefined, undefined)
//     let companies3 = await Company.findAll('c', undefined, undefined)
//     expect(companies1).toEqual([])
//     expect(companies2).toEqual([
      
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       }
//     ]);
//     expect(companies3).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       },
//     ]);
//   });

//   test("works: with filters", async function () {
//     let companies1 = await Company.findAll('c4', undefined, undefined);
//     let companies2 = await Company.findAll('c2', undefined, undefined)
//     let companies3 = await Company.findAll('c', undefined, undefined)
//     let companies4 = await Company.findAll(undefined, 2, undefined)
//     let companies5 = await Company.findAll(undefined, 1,2)
//     let companies6 = await Company.findAll('jakjsas', 1,2)
//     let companies7 = await Company.findAll('c1', 1,2)
//     let companies8 = await Company.findAll('c',undefined,2)
//     let companies9 = await Company.findAll(undefined,undefined,1)

//     expect(companies1).toEqual([])
//     expect(companies2).toEqual([
      
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       }
//     ]);
//     expect(companies3).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       },
//     ]);
//     expect(companies4).toEqual([
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       },
//     ])
//     expect(companies5).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       }
//     ])
//     expect(companies6).toEqual([])
//     expect(companies7).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       }
//     ])
//     expect(companies8).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       }
//     ])
//     expect(companies9).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       }
//     ])
//   });
});

// /************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Jobs.get("job1", "c1");
    expect(job).toEqual( {
        title: "job1",
        salary: 30000,
        equity: '0.5',
        company_handle: "c1",
      });
  });

  test("not found if no such company", async function () {
    try {
      await Jobs.get("nope", "nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "updatedJob",
    salary: 40000,
    equity: '0.75',

  };

  test("works", async function () {
    let job = await Jobs.update("job1", "c1", updateData);
    expect(job).toEqual({
        title: "updatedJob",
        salary: 40000,
        equity: '0.75',
        company_handle: "c1",
      });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE company_handle = 'c1' AND title = 'updatedJob'`);
    expect(result.rows).toEqual([{
        title: "updatedJob",
        salary: 40000,
        equity: '0.75',
        company_handle: "c1",
      }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      
      salary: 60000,
      equity: '0.80',
      
    };

    let job = await Jobs.update("job1","c1", updateDataSetNulls);
    expect(job).toEqual({
        title: "job1",
        salary: 60000,
        equity: '0.80',
        company_handle: "c1",
      });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE company_handle = 'c1' AND title = 'job1'`);
    expect(result.rows).toEqual([{
        title: "job1",
        salary: 60000,
        equity: '0.80',
        company_handle: "c1",
      }]);
  });

  test("not found if no such job", async function () {
    try {
      await Jobs.update("job1", "clol", updateData);
      fail();
    } catch (err) {

      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Jobs.update("job1","c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  
});

});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Jobs.remove("job1","c1");
    const res = await db.query(
        "SELECT company_handle FROM jobs WHERE company_handle='c1' AND title = 'job1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Jobs.remove("nope", "c1");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
