const request = require("supertest");
const app = require("../index");

describe("Company Isolation", () => {

  test("ABC manager should only see ABC employees", async () => {

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "manager1@abc.com",
        password: "password123"
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.status).toBe("SUCCESS");

    // Token is inside data
    const token = loginResponse.body.data.token;

    expect(token).toBeDefined();

    const response = await request(app)
      .get("/api/dashboard/active")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    const shifts = response.body.data;

    expect(Array.isArray(shifts)).toBe(true);

    // Every shift must belong to the logged-in manager's company
    shifts.forEach((shift) => {
      expect(Number(shift.company_id)).toBe(
        loginResponse.body.data.company_id
      );
    });

    const names = shifts.map(
      (shift) => shift.employee_name
    );

    console.log("ABC active employees:", names);

    // ABC employees
    expect(names).toContain("Rahul Sharma");
    expect(names).toContain("Priya Patil");

    // XYZ employees must not appear
    expect(names).not.toContain("Neha Singh");
    expect(names).not.toContain("Arjun Reddy");
  });


  test("XYZ manager should only see XYZ employees", async () => {

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "manager2@xyz.com",
        password: "password123"
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.status).toBe("SUCCESS");

    const token = loginResponse.body.data.token;

    expect(token).toBeDefined();

    const response = await request(app)
      .get("/api/dashboard/active")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    const shifts = response.body.data;

expect(Array.isArray(shifts)).toBe(true);

    // Every shift must belong to the logged-in manager's company
    shifts.forEach((shift) => {
      expect(Number(shift.company_id)).toBe(
        loginResponse.body.data.company_id
      );
    });

    const names = shifts.map(
      (shift) => shift.employee_name
    );

    console.log("XYZ active employees:", names);

    // XYZ employees
    expect(names).toContain("Neha Singh");
    expect(names).toContain("Arjun Reddy");

    // ABC employees must not appear
    expect(names).not.toContain("Rahul Sharma");
    expect(names).not.toContain("Priya Patil");
  });

});