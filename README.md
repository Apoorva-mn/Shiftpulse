# ShiftPulse

ShiftPulse is a workforce attendance and live-shift tracking application. Employees can clock in/out and share their location during an active shift, while managers can monitor on-shift employees and their geofence status in real time.

## How to Run

### Prerequisites

* Docker Desktop


### Start the application

From the project root directory:

```bash
docker compose up --build
```

Docker Compose starts:

* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5000`
* **MySQL:** `localhost:3306`

The frontend is available at:

```text
http://localhost:3000
```

The backend API is available at:

```text
http://localhost:5000
```

MySQL runs internally on port:

```text
3306
```

### Stop the application

```bash
docker compose down
```

### Restart the application

```bash
docker compose restart
```

### Rebuild after changes

If Docker configuration or dependencies have changed:

```bash
docker compose down
docker compose up --build
```

### Demo Login

Manager:

```text
Email: manager1@abc.com
Password: password123
```

A second manager account is also available:

```text
Email: manager2@xyz.com
Password: password123
```

Demo employee accounts are included in the database seed data.(seed.js)
password remain same for all users (password123)

---

## What I Finished

### Authentication

* Implemented login using email/password.
* Added JWT-based authentication.
* Manager and employee roles are supported.
* Login checks whether the employee already has an active shift 

### Employee Shift Flow

* Employee can clock in.
* A shift is created dynamically when the employee clocks in.
* Employee can clock out.
* Active shift validation is performed before processing location updates.
* Shift records are not pre-seeded because they represent actual attendance sessions.



### Geofencing

* Each company location has a latitude, longitude and configured radius.
* The employee's distance from the assigned workplace is calculated.
* The employee is classified as `inside` or `outside` the geofence.

### Manager Dashboard
* Dashboard is empty initially when no employees are currently on shift.
* Once an employee clocks in, their details are added to the dashboard.
* Shows employee name, clock-in time and elapsed time.
* Shows current geofence status.
* Dashboard updates automatically without requiring a page refresh.
### Real-Time Updates

* Implemented WebSocket communication for live employee location/geofence updates.
* Location updates are pushed to connected manager dashboards.

### Docker

* Added Docker setup for frontend, backend and MySQL.
* Added Docker Compose configuration.
* MySQL health checking is configured.

---

## What I Deliberately Skipped and Why

I focused on the **live-shift and attendance functionality** requested in the exercise.



### Advanced Shift Scheduling

Recurring shifts, shift templates, overtime rules and advanced scheduling were outside the core live-shift requirement.

### Payroll

Payroll calculations, payslips, tax calculations and payroll processing were outside the scope of this exercise.


### Extensive Automated Testing

The core workflow was manually tested and debugged end-to-end. A complete automated unit/integration/e2e test suite was not added due to the time constraint.

---

Approximate Time Taken

Approximately 5–6 hours, including development, integration, debugging, manual testing, and Docker setup.