
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");

const authDL = require("../DL/authDL");
const {
    employeeClockedIn,
    employeeClockedOut
} = require("../../socket");
const {employeeGeofenceUpdated}=require("../../socket")

const {getGeofenceStatus}=require("../../geofence")

const tokenSecret = process.env.JWT_SECRET;


// genrate token

function generateToken(user) {
    return jsonwebtoken.sign(
        {
            data: {
                id: user.id,
                company_id: user.company_id,
                location_id: user.location_id,
                role: user.role,
            },
        },
        tokenSecret,
        {
            expiresIn: "24h",
        }
    );
}


// login

const login = async (email, password) => {
    try {
        let response = {};
        const user = await authDL.getUserByEmail(email);
        if (!user) {
            response["status"] = "FAILURE";
            response["message"] = "Invalid email or password";
            return response;
        }
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );
        if (!isPasswordValid) {
            response["status"] = "FAILURE";
            response["message"] = "Invalid email or password";
            return response;
        }
        const token = generateToken(user);
        let data = {
            employee_id: user.id,
            company_id: user.company_id,
            location_id: user.location_id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
            shiftId:user.shiftId,
        };
        response["status"] = "SUCCESS";
        response["data"] = data;
        return response;
    } catch (error) {
        console.error(
            "BL - Login error:",
            error.message
        );
        throw error;
    }
};


// clockin
const clockIn = async (
    employeeId,
    companyId,
    locationId
) => {
    try {
        let response = {};

        const activeShift =
            await authDL.getActiveShift(
                employeeId,
                companyId
            );

        if (activeShift) {
            response["status"] = "FAILURE";
            response["message"] =
                "Employee already has an active shift";

            return response;
        }

        const result =
            await authDL.clockInShift(
                employeeId,
                companyId,
                locationId
            );

        if (result.affectedRows === 0) {
            response["status"] = "FAILURE";
            response["message"] =
                "Unable to clock in";

            return response;
        }

        const employee =
            await authDL.getUserById(employeeId);

        const clockInTime = new Date();

        employeeClockedIn(companyId, {
            shift_id: result.insertId,
            employee_id: employeeId,
            employee_name: employee.name,
            company_id: companyId,
            location_id: locationId,
            clock_in: clockInTime,
            clock_out: null,
            status: "active"
        });

        response["status"] = "SUCCESS";

        response["data"] = {
            shift_id: result.insertId,
            employee_id: employeeId,
            employee_name: employee.name,
            company_id: companyId,
            location_id: locationId,
            clock_in: clockInTime,
            clock_out: null,
            status: "active"
        };

        return response;

    } catch (error) {
        console.error(
            "BL - Clock-in error:",
            error.message
        );

        throw error;
    }
};

// clockout
const clockOut = async (
    employeeId,
    companyId
) => {
    try {
        const activeShift =
            await authDL.getActiveShift(
                employeeId,
                companyId
            );

        if (!activeShift) {
            return {
                status: "FAILURE",
                message: "No active shift found"
            };
        }

        const clockOutTime = new Date();

        const result =
            await authDL.clockOutShift(
                employeeId,
                companyId
            );

        if (result.affectedRows === 0) {
            return {
                status: "FAILURE",
                message: "Unable to clock out"
            };
        }

        employeeClockedOut(companyId, {
            shift_id: activeShift.id,
            employee_id: employeeId,
            company_id: companyId,
            clock_out: clockOutTime,
            status: "completed"
        });

        return {
            status: "SUCCESS",
            data: {
                shift_id: activeShift.id,
                employee_id: employeeId,
                company_id: companyId,
                clock_out: clockOutTime,
                status: "completed"
            }
        };

    } catch (error) {
        console.error(
            "BL - Clock-out error:",
            error.message
        );

        throw error;
    }
};

const getActiveShifts = async (companyId) => { 
    try { 
        let response = {};
         const shifts = await authDL.getActiveShifts(companyId); 
         response["status"] = "SUCCESS";
          response["data"] = shifts; 
          return response;
         } catch (error) 
         { 
            console.error("BL - Get active shifts error:", error.message);
             throw error;
             }
             };



// ping

const ping = async (
    shiftId,
    employeeId,
    companyId,
    lat,
    lng
) => {
    try {
       
       
        if (
            lat === undefined ||
            lat === null ||
            lng === undefined ||
            lng === null
        ) {
            return {
                status: "FAILURE",
                message: "Latitude and longitude are required"
            };
        }

        const shift = await authDL.getActiveShiftById(
            shiftId,
            employeeId,
            companyId
        );

        console.log("shiftId:", shiftId);
        console.log("shift:", shift);

        if (!shift) {
            return {
                status: "FAILURE",
                message: "Active shift not found"
            };
        }

        // Employee has not clocked in
        if (!shift.clock_in) {
            return {
                status: "FAILURE",
                message: "Employee has not clocked in"
            };
        }

        // Employee has already clocked out
        if (shift.clock_out !== null) {
            return {
                status: "FAILURE",
                message: "Employee has already clocked out"
            };
        }

        // Shift must be active
        if (shift.status !== "active") {
            return {
                status: "FAILURE",
                message: "Shift is not active"
            };
        }

        const location = await authDL.getLocationById(
            shift.location_id,
            companyId
        );

        if (!location) {
            return {
                status: "FAILURE",
                message: "Assigned location not found"
            };
        }

        const geofence = getGeofenceStatus(
            Number(lat),
            Number(lng),
            Number(location.latitude),
            Number(location.longitude),
            Number(location.radius_meters)
        );

        const timestamp = new Date();

        await authDL.saveShiftPing(
            shiftId,
            employeeId,
            companyId,
            Number(lat),
            Number(lng),
            timestamp,
            geofence.status
        );

        employeeGeofenceUpdated(
            companyId,
            {
                shift_id: shiftId,
                employee_id: employeeId,
                latitude: Number(lat),
                longitude: Number(lng),
                geofence_status: geofence.status,
                distance: geofence.distance,
                recorded_at: timestamp
            }
        );

        return {
            status: "SUCCESS",
            data: {
                shift_id: shiftId,
                latitude: Number(lat),
                longitude: Number(lng),
                geofence_status: geofence.status,
                distance: geofence.distance,
                recorded_at: timestamp
            }
        };

    } catch (error) {
        console.error(
            "BL - Ping error:",
            error.message
        );

        throw error;
    }
};



module.exports = {
    login,
    clockIn,
    clockOut,
    getActiveShifts,
    ping
};

