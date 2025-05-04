// 📁 routes/volunteer.routes.js
const express = require("express");
const router = express.Router();
const volunteerController = require("../controllers/volunteerController");

router.post("/activities", volunteerController.postActivity);
router.post("/schedule", volunteerController.scheduleActivity);
router.get("/match/:volunteer_id", volunteerController.matchVolunteer);
router.post("/participate", volunteerController.participateInActivity);
router.get("/activities/volunteers/:schedule_id", volunteerController.getVolunteersForActivity);

module.exports = router;
