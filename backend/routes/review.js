const express = require("express");
const router = express.Router({mergeParams :true});
const wrapAsync = require("../util/wrapAsync.js");
const ExpressError = require("../util/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middleware.js")
const reviewController = require("../controllers/reviews.js")
const review = require("../models/review.js")


 
//post reviews route~
router.post("/",isLoggedIn,validateReview,
    wrapAsync (reviewController.createReview)
   
   
);

//delete reviews route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;