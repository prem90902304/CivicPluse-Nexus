# CivicPulse Nexus – Backend (Milestone 1)

## Prerequisites
- Java 21 (`java -version`)
- Maven 3.9+
- PostgreSQL 14+ running locally
- IntelliJ IDEA Ultimate (recommended) or VS Code + Java extensions

## 1. Database Setup
```sql
CREATE DATABASE civicpulse_nexus_db;
CREATE USER civicpulse_admin WITH ENCRYPTED PASSWORD 'change_me_local_dev';
GRANT ALL PRIVILEGES ON DATABASE civicpulse_nexus_db TO civicpulse_admin;
```
Update `src/main/resources/application-dev.yml` if you used different credentials/port.

## 2. Run the Application
```bash
mvn spring-boot:run
```
Default active profile is `dev` (see `application.yml`). Hibernate will auto-create
all tables on first run (`ddl-auto: update`).

The API will be live at `http://localhost:8080/api`.

## 3. Seeding Your First ADMIN and OFFICIAL

Self-registration (`POST /api/auth/register`) always creates a `CITIZEN` — this
is intentional (see RegisterRequest's Javadoc: role assignment must never be
client-controlled). To create test ADMIN/OFFICIAL accounts for Milestone 1:

1. Register three accounts normally through `/api/auth/register`
   (e.g. `citizen@test.com`, `official@test.com`, `admin@test.com`).
2. Promote two of them directly in the database:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com';
   UPDATE users SET role = 'OFFICIAL', department_id = 1 WHERE email = 'official@test.com';
   ```
   (Create a department first via `POST /api/departments` as the promoted admin,
   or insert one directly: `INSERT INTO departments (name, description, created_at, updated_at)
   VALUES ('Roads & Infrastructure', 'Handles road issues', now(), now());`)
3. Log in as each to get their JWTs, and paste them into the Postman collection's
   `citizenToken` / `officialToken` / `adminToken` variables.

*(A dedicated `/api/admin/users` provisioning endpoint — so admins can create
Official accounts through the UI instead of raw SQL — is a natural Milestone 2
addition; flagging it here as a known gap rather than silently glossing over it.)*

## 4. Testing with Postman
Import `CivicPulse-Nexus-Milestone1.postman_collection.json` from this folder.
Recommended run order:
1. Auth → Register Citizen → Login Citizen (copy token into `citizenToken`)
2. Departments & Categories (as ADMIN) → create at least one department + category
3. Complaints → Create Complaint (as CITIZEN) → copy the returned `id` into `complaintId`
4. Complaints → Assign Complaint (as ADMIN) → assign to the official
5. Complaints → Update Status (as OFFICIAL) → walk through SUBMITTED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
6. Complaints → Get Complaint Timeline → verify every transition was recorded
7. Complaints → Search & Filter, Dashboard Stats → as ADMIN/OFFICIAL
8. Notifications → Get My Notifications → verify status-change notifications arrived

## 5. SLA / Escalation Testing
The escalation job runs every 15 minutes (`app.sla.escalation-check-cron`).
To test it quickly without waiting: temporarily set a category's `slaHours` to
a very small value (e.g. via a manual SQL update on an existing complaint's
`sla_deadline` to a past timestamp), then wait for the next cron tick — the
complaint should flip to `ESCALATED`, an `escalation_logs` row should appear,
and both the citizen and assigned official should receive a notification.

## Known Milestone-1-scope limitations (by design, not oversights)
- Notifications are in-app only (no email/SMS) — see NotificationServiceImpl's note.
- No admin UI for provisioning OFFICIAL/ADMIN accounts yet (see step 3 above).
- No Flyway/Liquibase migrations yet — `ddl-auto: update` is a dev convenience.
