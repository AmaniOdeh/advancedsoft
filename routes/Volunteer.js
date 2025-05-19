const express = require("express");
const router = express.Router();
const volunteerController = require("../controllers/volunteerController");
const { authenticateJWT } = require("../middleware/auth.middleware");

// Existing
router.post("/activities/post", authenticateJWT,volunteerController.postActivity);
router.post("/activities/schedule", authenticateJWT,volunteerController.scheduleActivity);
router.get("/volunteers/match/:volunteer_id",authenticateJWT, volunteerController.matchVolunteer);
router.get("/activities/volunteers/:schedule_id",authenticateJWT, volunteerController.getVolunteersForActivity);

// New APIs for request & approval flow
router.post("/activities/request",authenticateJWT, volunteerController.requestToJoinActivity);
router.get("/activities/requests/:orphanage_id",authenticateJWT, volunteerController.getVolunteerRequests);
router.patch("/activities/request/respond/:request_id",  authenticateJWT,volunteerController.respondToRequest);

module.exports = router;
