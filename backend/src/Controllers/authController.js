
const authBl = require("../BL/authBl");


const errorWrap = (fn) => {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


// login

const login = errorWrap(
  async function (req, res, next) {
    try {

      let response = await authBl.login(
        req.body.email,
        req.body.password
      );

      if (response) {

        if (response.status !== "FAILURE") {

          return res.status(200).send(response);

        } else {

          return res.status(400).send(response);

        }

      }

      return res.status(500).send({
        status: "FAILURE",
        message: "Something went wrong...",
      });

    } catch (error) {

      console.error(
        "Controller - Login error:",
        error.message
      );

      return res.status(500).send({
        status: "FAILURE",
        message: "Something went wrong...",
      });

    }
  }
);


// clcokin

const clockIn = errorWrap(
  async function (req, res, next) {
    try {
     
      const employeeId = req.user.id;
      const companyId = req.user.company_id;
      const locationId = req.user.location_id;

      if (Number(req.params.employee_id) !== employeeId) {

        return res.status(403).send({
          status: "FAILURE",
          message: "You can only clock in yourself",
        });

      }

      if (!locationId) {

        return res.status(400).send({
          status: "FAILURE",
          message: "No location assigned to this employee",
        });

      }

      let response = await authBl.clockIn(
        employeeId,
        companyId,
        locationId
      );
      if (response) {

        if (response.status !== "FAILURE") {

          return res.status(200).send(response);

        } else {

          return res.status(400).send(response);

        }

      }

      return res.status(500).send({
        status: "FAILURE",
        message: "Something went wrong...",
      });

    } catch (error) {

      console.error(
        "Controller - Clock-in error:",
        error.message
      );

      return res.status(500).send({
        status: "FAILURE",
        message: "Something went wrong...",
      });

    }
  }
);


// clcokout

const clockOut = errorWrap(
  async function (req, res, next) {
    try {

      console.log(req, "reqqq")
      const employeeId = req.user.id;
      const companyId = req.user.company_id;
      if (Number(req.params.employee_id) !== employeeId) {

        return res.status(403).send({
          status: "FAILURE",
          message: "You can only clock out yourself",
        });

      }


      let response = await authBl.clockOut(
        employeeId,
        companyId
      );


      if (response) {

        if (response.status !== "FAILURE") {

          return res.status(200).send(response);

        } else {

          return res.status(400).send(response);

        }

      }
      return res.status(500).send({
        status: "FAILURE",
        message: "Something went wrong...",
      });

    } catch (error) {

      console.error(
        "Controller - Clock-out error:",
        error.message
      );

      return res.status(500).send({
        status: "FAILURE",
        message: "Something went wrong...",
      });

    }
  }
);




const getActiveShifts = errorWrap(
  async function (req, res, next) {

    try {

      const companyId =
        req.user.company_id;
      const response =
        await authBl.getActiveShifts(
          companyId
        );
      if (response) {

        if (response.status !== "FAILURE") {

          return res
            .status(200)
            .send(response);

        } else {

          return res
            .status(400)
            .send(response);

        }

      }
      return res.status(500).send({
        status: "FAILURE",
        message: "Something went wrong...",
      });

    } catch (error) {

      console.error(
        "Controller - Active shifts error:",
        error.message
      );

      return res.status(500).send({
        status: "FAILURE",
        message: "Something went wrong...",
      });

    }
  }
);


// ping
const ping = async (req, res) => {
    try {
        console.log(req, "reqqq")

        const shiftId = Number(req.params.shiftId);

        const employeeId = req.user.id;

        const companyId = req.user.company_id;

        const {
            lat,
            lng,
            timestamp
        } = req.body;

        if (
            lat === undefined ||
            lat === null ||
            lng === undefined ||
            lng === null
        ) {
            return res.status(400).json({
                status: "FAILURE",
                message: "lat and lng are required"
            });
        }
        const response = await authBl.ping(
            shiftId,
            employeeId,
            companyId,
            lat,
            lng,
            timestamp
        );


        return res.status(
            response.status === "SUCCESS"
                ? 200
                : 400
        ).json(response);

    } catch (error) {

        console.error(
            "Controller - Ping error:",
            error.message
        );

        return res.status(500).json({
            status: "FAILURE",
            message: "Internal server error"
        });
    }
};










module.exports = {
  login,
  clockIn,
  clockOut,
  getActiveShifts,
  ping
};
