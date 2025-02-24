if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./util/ExpressError.js");
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")
// const review = require("./models/review.js");
const Listing = require("./models/listing"); // Listing model ko import karein
const cors = require('cors');

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }));
 
const dbUrl = process.env.MONGO_URL

main()
.then((res) => {
    console.log("connected to db")
})
.catch((err) => {
    console.log(err)
})



async function main() {
    await mongoose.connect(dbUrl)
}


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


// // yha hmne mongo session store ka code likha but isko chalo mt krn waring


// const store = MongoStore.create({
//     mongoUrl: dbURL,
//     crypto: {
//         secret: "mysuperstar",
//     },
//     touchAfter: 24 * 3600,
// });

// store.on("error",() => {
//     console.log("ERROR IN MONGO SESSION STORE",err);
// });


// yha hmne mongo session store ka code likha 


const sessionOptions = {
    secret : process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
     expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
     maxage: + 7 * 24 * 60 * 60 * 1000,
     httponly:true, //your session cookie to enhance security. protect against Cross-Site Scripting (XSS) attacks
    },
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user;
    next();
});

// Health check endpoint
// app.get('/health', (req, res) => {
//     res.status(200).json({ message: 'Server is healthy!' });
// });


//inse pehle krn h 
app.get("/", async (req, res) => {
    const allListings = await Listing.find({}); // Sabhi listings ko fetch karein
    res.render("listings/index", { allListings });
});
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)





app.all("*",(req,res,next) => {
    next(new ExpressError(404,"page Not Found!"))
})    //line 98 to 106 error handler middler create



app.use((err,req,res,next) => {
    let{statusCode=500,message="Something Went Wrong !"} = err;
    res.status(statusCode).render("error.ejs",{message})
    // res.status(statusCode).send(message)
})

// Default route for checking API status
app.get("/", (req, res) => {
    res.send("API is running...");
  });

app.listen(5000, () => {
    console.log("server is listening to port 5000")
});