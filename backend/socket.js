
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

let wss;

const clients = new Set();


//websocket initaite

const initWebSocket = (server) => {

    wss = new WebSocket.Server({
        server,
        path: "/ws"
    });


    wss.on("connection", (socket, request) => {

        try {


            const url = new URL(
                request.url,
                `http://${request.headers.host}`
            );

            const token =
                url.searchParams.get("token");


            if (!token) {

                socket.close(
                    1008,
                    "Authentication required"
                );

                return;
            }

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

            socket.user = {

                userId:
                    decoded.data.id,

                companyId:
                    decoded.data.company_id,

                role:
                    decoded.data.role
            };


            if (
                socket.user.role !== "manager"
            ) {

                socket.close(
                    1008,
                    "Manager access required"
                );

                return;
            }

            clients.add(socket);


            console.log(
                `Manager connected - User: ${socket.user.userId}, Company: ${socket.user.companyId}`
            );

            socket.send(
                JSON.stringify({

                    event: "connected",

                    message:
                        "Connected to ShiftPulse live updates"
                })
            );


            // disconnct

            socket.on("close", () => {

                clients.delete(socket);

                console.log(
                    `Manager disconnected - User: ${socket.user.userId}`
                );
            });


            

            socket.on("error", (error) => {

                console.error(
                    "WebSocket error:",
                    error.message
                );
            });


        } catch (error) {

            console.error(
                "WebSocket authentication failed:",
                error.message
            );

            socket.close(
                1008,
                "Invalid token"
            );
        }
    });


    return wss;
};




const broadcastToCompanyManagers = (
    companyId,
    event,
    data
) => {

    console.log("WebSocket broadcast");
    console.log("Company:", companyId);
    console.log("Event:", event);
    console.log("Connected clients:", clients.size);

    clients.forEach((socket) => {

        console.log("Client:", socket.user);
        console.log(
            "Socket state:",
            socket.readyState
        );

        if (
            socket.readyState === WebSocket.OPEN &&
            socket.user &&
            socket.user.role === "manager" &&
            Number(socket.user.companyId) === Number(companyId)
        ) {

            console.log(
                "Sending event to manager"
            );

            socket.send(
                JSON.stringify({
                    event,
                    data
                })
            );
        }
    });
};




const employeeClockedIn = (
    companyId,
    employee
) => {

    broadcastToCompanyManagers(
        companyId,
        "employee.clocked_in",
        employee
    );
};




const employeeClockedOut = (
    companyId,
    employee
) => {

    broadcastToCompanyManagers(
        companyId,
        "employee.clocked_out",
        employee
    );
};


// update geofence

const employeeGeofenceUpdated = (
    companyId,
    employee
) => {

    broadcastToCompanyManagers(
        companyId,
        "employee.geofence_updated",
        employee
    );
};


module.exports = {

    initWebSocket,

    employeeClockedIn,

    employeeClockedOut,

    employeeGeofenceUpdated
};

