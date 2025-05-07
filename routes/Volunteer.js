const express = require("express");
const router = express.Router();
const volunteerController = require("../controllers/volunteerController");

// Existing
router.post("/activities/post", volunteerController.postActivity);
router.post("/activities/schedule", volunteerController.scheduleActivity);
router.get("/volunteers/match/:volunteer_id", volunteerController.matchVolunteer);
router.post("/activities/participate", volunteerController.participateInActivity);
router.get("/activities/volunteers/:schedule_id", volunteerController.getVolunteersForActivity);

// New APIs for request & approval flow
router.post("/activities/request", volunteerController.requestToJoinActivity);
router.get("/activities/requests/:orphanage_id", volunteerController.getVolunteerRequests);
router.patch("/activities/request/respond/:request_id", volunteerController.respondToRequest);

module.exports = router;
