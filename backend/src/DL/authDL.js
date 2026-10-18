
const db = require("../../db");


const getUserByEmail = async (email) => {
    try {
        const query = `
            SELECT
                u.id,
                u.company_id,
                u.location_id,
                u.name,
                u.email,
                u.password,
                u.role,
                s.id AS shiftId
            FROM users u
            LEFT JOIN shifts s
                ON s.employee_id = u.id
                AND s.status = 'active'
            WHERE u.email = ?
            ORDER BY s.clock_in DESC
            LIMIT 1
        `;

        const values = [email];

        const [rows] = await db.query(query, values);

        if (rows.length === 0) {
            return null;
        }

        return {
            ...rows[0],
            shiftId: rows[0].shiftId || null
        };

    } catch (error) {
        console.error(
            "DL - Error fetching user:",
            error.message
        );

        throw error;
    }
};





// const getActiveShifts = async (companyId) => {
//     try {

//         const query = `
//             SELECT
//                 s.id AS shift_id,
//                 s.employee_id,
//                 u.name AS employee_name,
//                 s.company_id,
//                 s.location_id,
//                 s.clock_in,
//                 s.clock_out,
//                 s.status,
//                 sl.latitude,
//                 sl.longitude,
//                 sl.geofence_status,
//                 sl.recorded_at
//             FROM shifts s

//             INNER JOIN users u
//                 ON u.id = s.employee_id

//             LEFT JOIN shift_locations sl
//                 ON sl.id = (
//                     SELECT sl2.id
//                     FROM shift_locations sl2
//                     WHERE sl2.shift_id = s.id
//                     ORDER BY sl2.recorded_at DESC, sl2.id DESC
//                     LIMIT 1
//                 )

//             WHERE s.company_id = ?
//               AND s.status = 'active'
//               AND s.clock_out IS NULL

//             ORDER BY s.clock_in ASC
//         `;

//         const [rows] = await db.query(
//             query,
//             [companyId]
//         );

//         return rows;

//     } catch (error) {

//         console.error(
//             "DL - Error fetching active shifts:",
//             error.message
//         );

//         throw error;
//     }
// };

const getActiveShifts = async (companyId) => {
    try {
        const query = `
            SELECT
                s.id AS shift_id,
                s.employee_id,
                u.name AS employee_name,
                s.company_id,
                s.location_id,
                s.clock_in,
                s.clock_out,
                s.status,
                sl.latitude,
                sl.longitude,
                sl.geofence_status,
                sl.recorded_at
            FROM shifts s
            INNER JOIN users u
                ON u.id = s.employee_id
            LEFT JOIN shift_locations sl
                ON sl.id = (
                    SELECT sl2.id
                    FROM shift_locations sl2
                    WHERE sl2.shift_id = s.id
                    ORDER BY sl2.recorded_at DESC
                    LIMIT 1
                )
            WHERE s.company_id = ?
              AND s.id = (
                  SELECT MAX(s2.id)
                  FROM shifts s2
                  WHERE s2.employee_id = s.employee_id
                    AND s2.company_id = s.company_id
              )
            ORDER BY s.clock_in ASC
        `;

        const [rows] = await db.query(
            query,
            [companyId]
        );

        return rows;

    } catch (error) {
        console.error(
            "DL - Error fetching shifts:",
            error.message
        );

        throw error;
    }
};

const getUserById = async (employeeId) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            name
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [employeeId]
    );

    return rows[0] || null;
};








// Clockin

const clockInShift = async (
    employeeId,
    companyId,
    locationId
) => {
    try {
        const query = `
            INSERT INTO shifts
            (
                employee_id,
                company_id,
                location_id,
                clock_in,
                status
            )
            VALUES (?, ?, ?, NOW(), 'active')
        `;

        const values = [
            employeeId,
            companyId,
            locationId
        ];

        const [result] = await db.query(
            query,
            values
        );

        return result;

    } catch (error) {
        console.error(
            "DL - Error clocking in shift:",
            error.message
        );

        throw error;
    }
};


// Clockout

const clockOutShift = async (
    employeeId,
    companyId
) => {
    try {
        const query = `
            UPDATE shifts
            SET
                clock_out = NOW(),
                status = 'completed'
            WHERE employee_id = ?
              AND company_id = ?
              AND status = 'active'
              AND clock_out IS NULL
        `;

        const values = [
            employeeId,
            companyId
        ];

        const [result] = await db.query(
            query,
            values
        );

        return result;

    } catch (error) {
        console.error(
            "DL - Error clocking out shift:",
            error.message
        );

        throw error;
    }
};


const getActiveShiftById = async (
    shiftId,
    employeeId,
    companyId
) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            employee_id,
            company_id,
            location_id,
            clock_in,
            clock_out,
            status
        FROM shifts
        WHERE id = ?
          AND employee_id = ?
          AND company_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [
            shiftId,
            employeeId,
            companyId
        ]
    );

    return rows[0] || null;
};


const getLocationById = async (
    locationId,
    companyId
) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            company_id,
            name,
            latitude,
            longitude,
            radius_meters,
            shift_start,
            shift_end
        FROM company_locations
        WHERE id = ?
          AND company_id = ?
        LIMIT 1
        `,
        [
            locationId,
            companyId
        ]
    );

    return rows[0] || null;
};


const getActiveShift = async (
    employeeId,
    companyId
) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            employee_id,
            company_id,
            location_id,
            clock_in,
            clock_out,
            status
        FROM shifts
        WHERE employee_id = ?
          AND company_id = ?
          AND status = 'active'
          AND clock_out IS NULL
        LIMIT 1
        `,
        [
            employeeId,
            companyId
        ]
    );

    return rows[0] || null;
};


const saveShiftPing = async (
    shiftId,
    employeeId,
    companyId,
    latitude,
    longitude,
    timestamp,
    geofenceStatus
) => {

    const [result] = await db.query(
        `
        INSERT INTO shift_locations
        (
            shift_id,
            employee_id,
            company_id,
            latitude,
            longitude,
            geofence_status,
            recorded_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            shiftId,
            employeeId,
            companyId,
            latitude,
            longitude,
            geofenceStatus,
            timestamp
        ]
    );

    return result;
};





module.exports = {
    getUserByEmail,
    getActiveShifts,
    clockInShift,
    clockOutShift,
    getActiveShiftById,
    getLocationById,
    saveShiftPing,
    getActiveShift,
    getUserById
};

