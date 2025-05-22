# HopeConnect – Supporting Orphaned Children in Gaza After War

A RESTful API backend platform built with **Node.js**, **Express**, and **MySQL** to support orphaned children in Gaza through a secure and transparent donation, sponsorship, and volunteering system.

---

##  Table of Contents
1. [Project Description](#project-description)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [How to Run](#how-to-run)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [License](#license)

---

##  Project Description

HopeConnect is an initiative focused on delivering humanitarian aid and long-term support for orphans in Gaza. This backend provides:

- Secure user management (orphanages, donors, volunteers, admins)
- Real-time donation and sponsorship tracking
- Emergency campaign support
- Volunteer coordination
- Report generation and transparency tools
- Verified orphanage registration system

---

##  Features

- Orphan profile management & sponsorship linking
- General and emergency donation handling
- Volunteer activity matching and approval system
- Orphanage reporting in PDF with email delivery
- Resource delivery tracking and partner NGO management
- JWT authentication and role-based access control
- Admin-only verification workflow for sensitive accounts

---

##  Tech Stack

| Layer         | Technology                  |
|--------------|------------------------------|
| Backend       | Node.js + Express.js         |
| Database      | MySQL                        |
| ORM           | Sequelize                    |
| Auth          | JWT + bcryptjs               |
| PDF Reports   | PDFKit                       |
| Email Service | Nodemailer (SendGrid)        |
| External APIs | Stripe, Google Maps (planned)|
| Tools         | Postman, GitHub, MySQL Workbench |

---

##  Folder Structure

HopeConnect/
├── controllers/ # API logic
├── routes/ # Route handlers
├── models/ # Sequelize models
├── middlewares/ # JWT & auth
├── utils/ # PDF & email helpers
├── config/ # DB/Auth config
├── public/reports/ # Stored PDFs
├── .env # Environment vars
├── app.js # Main entry
└── README.md

yaml
Copy
Edit

---

##  How to Run

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Then fill DB credentials, JWT_SECRET, email keys etc.

# Run the server
node app.js
 API Endpoints
Feature	Method	Endpoint
Auth (login/signup)	POST	/api/login /api/signup
Orphans	GET	/api/orphans
Sponsorships	POST	/api/sponsorships
Donations	POST	/api/donations
Emergency Campaigns	POST	/api/emergency-campaigns
Reports (PDF)	POST	/api/orphan-reports
Delivery Tracking	POST	/api/deliveries
Partner NGOs	POST	/api/partners
Volunteer Requests	POST	/api/volunteer-requests

 Some routes are role-protected via JWT middleware.

 Database Schema
25+ normalized tables

All use InnoDB + Foreign Keys

users table handles roles and verification

orphans, sponsorships, donations, orphan_reports, deliveries, etc.

Full schema in hopeconnect.sql
