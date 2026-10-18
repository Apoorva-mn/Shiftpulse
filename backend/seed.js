
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "shiftpulse",
});

async function seed() {
  const connection = await pool.getConnection();

  try {
    console.log("🌱 Starting seed...");

    await connection.beginTransaction();

    // --------------------------------------------------
    // 1. Clear existing data
    // --------------------------------------------------

    // await connection.query("DELETE FROM geofence_events");
    await connection.query("DELETE FROM shift_locations");
    await connection.query("DELETE FROM shifts");
    await connection.query("DELETE FROM users");
    await connection.query("DELETE FROM company_locations");
    await connection.query("DELETE FROM companies");

    console.log("🧹 Existing data cleared");

    // --------------------------------------------------
    // 2. Create Companies
    // --------------------------------------------------

    const [companyResult] = await connection.query(`
      INSERT INTO companies (company_name)
      VALUES
        ('ABC Technologies'),
        ('XYZ Solutions')
    `);

    const company1Id = companyResult.insertId;
    const company2Id = company1Id + 1;

    console.log("✅ Companies created");

    // --------------------------------------------------
    // 3. Create Company Locations
    // --------------------------------------------------

    // ABC Bangalore
    const [location1] = await connection.query(
      `
      INSERT INTO company_locations
      (
        company_id,
        name,
        latitude,
        longitude,
        radius_meters,
        shift_start,
        shift_end
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        company1Id,
        "ABC Bangalore Office",
        12.9716,
        77.5946,
        100,
        "09:00:00",
        "18:00:00",
      ]
    );

    const abcBangaloreLocationId = location1.insertId;

    // ABC Mysore
    const [location2] = await connection.query(
      `
      INSERT INTO company_locations
      (
        company_id,
        name,
        latitude,
        longitude,
        radius_meters,
        shift_start,
        shift_end
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        company1Id,
        "ABC Mysore Office",
        12.2958,
        76.6394,
        150,
        "09:00:00",
        "18:00:00",
      ]
    );

    const abcMysoreLocationId = location2.insertId;

    // XYZ Bangalore
    const [location3] = await connection.query(
      `
      INSERT INTO company_locations
      (
        company_id,
        name,
        latitude,
        longitude,
        radius_meters,
        shift_start,
        shift_end
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        company2Id,
        "XYZ Bangalore Office",
        12.9352,
        77.6245,
        100,
        "10:00:00",
        "19:00:00",
      ]
    );

    const xyzBangaloreLocationId = location3.insertId;

    // XYZ Hyderabad
    const [location4] = await connection.query(
      `
      INSERT INTO company_locations
      (
        company_id,
        name,
        latitude,
        longitude,
        radius_meters,
        shift_start,
        shift_end
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        company2Id,
        "XYZ Hyderabad Office",
        17.385,
        78.4867,
        150,
        "10:00:00",
        "19:00:00",
      ]
    );

    const xyzHyderabadLocationId = location4.insertId;

    console.log("✅ Company locations created");

    // --------------------------------------------------
    // 4. Password
    // --------------------------------------------------

    const password = await bcrypt.hash(
      "password123",
      10
    );

    // --------------------------------------------------
    // 5. Create Managers
    // --------------------------------------------------

    // ABC Manager
    // Assigned to ABC Bangalore Office
    await connection.query(
      `
      INSERT INTO users
      (
        company_id,
        location_id,
        name,
        email,
        password,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        company1Id,
        abcBangaloreLocationId,
        "ABC Manager",
        "manager1@abc.com",
        password,
        "manager",
      ]
    );

    // XYZ Manager
    // Assigned to XYZ Bangalore Office
    await connection.query(
      `
      INSERT INTO users
      (
        company_id,
        location_id,
        name,
        email,
        password,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        company2Id,
        xyzBangaloreLocationId,
        "XYZ Manager",
        "manager2@xyz.com",
        password,
        "manager",
      ]
    );

    console.log("✅ Managers created");

    // --------------------------------------------------
    // 6. Create Employees
    // --------------------------------------------------

    const employees = [
      // -------------------------
      // ABC Technologies
      // -------------------------
      {
        companyId: company1Id,
        locationId: abcBangaloreLocationId,
        name: "Rahul Sharma",
        email: "rahul@abc.com",
      },
      {
        companyId: company1Id,
        locationId: abcBangaloreLocationId,
        name: "Priya Patil",
        email: "priya@abc.com",
      },
      {
        companyId: company1Id,
        locationId: abcMysoreLocationId,
        name: "Amit Kumar",
        email: "amit@abc.com",
      },
      {
        companyId: company1Id,
        locationId: abcMysoreLocationId,
        name: "Sneha Rao",
        email: "sneha@abc.com",
      },
      {
        companyId: company1Id,
        locationId: abcBangaloreLocationId,
        name: "Vikas Joshi",
        email: "vikas@abc.com",
      },

      // -------------------------
      // XYZ Solutions
      // -------------------------
      {
        companyId: company2Id,
        locationId: xyzBangaloreLocationId,
        name: "Neha Singh",
        email: "neha@xyz.com",
      },
      {
        companyId: company2Id,
        locationId: xyzBangaloreLocationId,
        name: "Arjun Reddy",
        email: "arjun@xyz.com",
      },
      {
        companyId: company2Id,
        locationId: xyzHyderabadLocationId,
        name: "Kiran Shah",
        email: "kiran@xyz.com",
      },
      {
        companyId: company2Id,
        locationId: xyzHyderabadLocationId,
        name: "Pooja Mehta",
        email: "pooja@xyz.com",
      },
      {
        companyId: company2Id,
        locationId: xyzBangaloreLocationId,
        name: "Rohit Verma",
        email: "rohit@xyz.com",
      },
    ];

    for (const employee of employees) {
      await connection.query(
        `
        INSERT INTO users
        (
          company_id,
          location_id,
          name,
          email,
          password,
          role
        )
        VALUES (?, ?, ?, ?, ?, 'employee')
        `,
        [
          employee.companyId,
          employee.locationId,
          employee.name,
          employee.email,
          password,
        ]
      );
    }

    console.log("✅ 10 Employees created");

    // --------------------------------------------------
    // 7. Shifts
    // --------------------------------------------------
    // No shift data is inserted here.
    // Shifts will be created when an employee clocks in.

    // --------------------------------------------------
    // 8. Shift Locations
    // --------------------------------------------------
    // No shift location data is inserted here.
    // Locations will be recorded when an employee is on shift.

    // --------------------------------------------------
    // 9. Commit
    // --------------------------------------------------

    await connection.commit();

    console.log("\n🎉 Seed completed successfully!");

    console.log("\n================================");
    console.log("       DEMO ACCOUNTS");
    console.log("================================");

    console.log("\nABC Manager");
    console.log("Email: manager1@abc.com");
    console.log("Password: password123");

    console.log("\nXYZ Manager");
    console.log("Email: manager2@xyz.com");
    console.log("Password: password123");

    console.log("\nEmployee Example");
    console.log("Email: rahul@abc.com");
    console.log("Password: password123");

    console.log("\n================================");
    console.log("Companies: 2");
    console.log("Locations: 4");
    console.log("Managers: 2");
    console.log("Employees: 10");
    console.log("Active shifts: 0");
    console.log("Shift locations: 0");
    console.log("================================");

  } catch (error) {
    await connection.rollback();

    console.error("❌ Seed failed:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();

