"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");



const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /jobs", function () {
  const newJob = {
    title: "newJobLol",
    salary: 45000,
    equity: 0.78,
    companyHandle: "c1"
  };

  test("ok for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        title: "newJobLol",
        salary: 45000,
        equity: "0.78",
        companyHandle: "c1"
      },
    });
  });

  test("not ok for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
   
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "newInco",
          salary: 10,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "newJobLol",
          salary: 45000,
          equity: 0.78,
          companyHandle: 2333
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** GET /companies */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
              title: "j1",
              salary: 45000,
              equity: "0.78",
              company_handle: "c1"
            },
        
            {
              title: "j2",
              salary: 47000,
              equity: "0.78",
              company_handle: "c2"
            },
       
            {
              title: "j3",
              salary: 40000,
              equity: "0.58",
              company_handle: "c3"
            }
          ],
    });
  });

  test("with filters", async function () {
    const resp1 = await request(app).get("/jobs").query({"title": "1"});
    const resp2 = await request(app).get("/jobs").query({"title": "J1", "minSalary": 100000});
    const resp3 = await request(app).get("/jobs").query({"title": "j1", "minSalary": 1000, "lol": 23232});
    const resp4 = await request(app).get("/jobs").query({"hasEquity": true})
    const resp5 = await request(app).get("/jobs").query({"hasEquity": false})
    const resp6 = await request(app).get("/jobs").query({"minSalary": 44000, "title": "j"})
    expect(resp1.body).toEqual({
      jobs:
          [
            {
              title: "j1",
              salary: 45000,
              equity: "0.78",
              company_handle: "c1",
            }
          ],
    });
    expect(resp2.body).toEqual({jobs: []})
    expect(resp3.status).toEqual(400)
    expect(resp3.body.error.message).toEqual("No additional filters allowed")
    expect(resp4.body).toEqual(
      ({
                jobs:
                    [
                      {
                        title: "j1",
                        salary: 45000,
                        equity: "0.78",
                        company_handle: "c1"
                      },
                  
                      {
                        title: "j2",
                        salary: 47000,
                        equity: "0.78",
                        company_handle: "c2"
                      },
                 
                      {
                        title: "j3",
                        salary: 40000,
                        equity: "0.58",
                        company_handle: "c3"
                      }
                    ],
              }
            
    ))
    expect(resp5.body).toEqual({jobs: []})
   expect(resp6.body).toEqual(
    ({
              jobs:
                  [
                    {
                      title: "j1",
                      salary: 45000,
                      equity: "0.78",
                      company_handle: "c1"
                    },
                
                    {
                      title: "j2",
                      salary: 47000,
                      equity: "0.78",
                      company_handle: "c2"
                    },
               
                   
                  ],
            }
          
  ))
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

// /************************************** GET /jobs/:title/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/j1/c1`);
    expect(resp.body).toEqual({
      job: {
        title: "j1",
        salary: 45000,
        equity: "0.78",
        company_handle: "c1"
      },
    });
  });

  test("not found", async function () {
    const resp = await request(app).get(`/jobs/j5/c1`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:title/:company_handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/j1/c1`)
        .send({
          title: "j1_new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job : {
        title: "j1_new",
        salary: 45000,
        equity: "0.78",
        company_handle: "c1"
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/j1/c1`)
        .send({
          title: "j11-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .patch(`/companies/j1212/c1`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on company change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/j1/c1`)
        .send({
          company_handle: "c1-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/j1/c1`)
        .send({
          title: 1337,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/j2/c2`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: {
      job: "j2",
      company: "c2"} });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/j1/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/j3/c7787`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
