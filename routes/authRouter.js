const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const { storeReturnTo } = require("../utils/commonMiddlewares");

const router = express.Router();

router.get("/register", (req, res) => {
    res.render("auth/register");
});

router.post("/register", async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await User.register({ username, email }, password);
        req.login(newUser, err => {
            if (err) {
                next(err);
            } else {
                return res.redirect("/");
            }
        })
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/register")
    }
});

router.get("/login", (req, res) => {
    res.render("auth/login");
});

router.post(
    "/login",
    storeReturnTo,
    passport.authenticate(
        "local",
        {
            failureRedirect: "/login",
            failureFlash: true
        }
    ),
    (req, res) => {
        req.flash("success", `Welcome back, ${req.user.username}`);
        const returnTo = res.locals.returnTo || "/";
        res.redirect(returnTo);
    }
);

router.get("/logout", (req, res, next) => {
    const usernameBeforeLogout = req.user.username;
    req.logout(err => {
        if (err) {
            req.flash("error", err.message);
            return next(err);
        } else {
            req.flash("success", `Goodbye, ${usernameBeforeLogout}`);
            res.redirect("/");
        }
    });
});

module.exports = router;