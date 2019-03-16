"use strict";
// load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
const Models= require('./../user/user');

const { adminModel, courtModel }= Models;

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        adminModel.findById(id, function(err, user) {
            done(err, user);
        });
    });


    /*============================
        STRATEGIES START
    ============================*/

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
/* 
    passport.use('signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function(req, uname, password, done) {
        //userModel will not fire unless data is sent back
        process.nextTick(function() {
            usersModel.findOne({email}, function(err, user) {
                if(err) return done(err);

                if(user) return done(null, false, req.flash( 'signupMessage', 'You already have an account' ));
                else {
                    let { email= '', username= '', password= '', type= '' }= req.body;
                    var adminRef = adminsModel();

                    //setup user's local credentials
                    userRef.email      = email;
                    userRef.username   = username;
                    userRef.password   = password;
                    userRef.type       = type;

                    //save the user
                    adminRef.save(function(err, data) {
                        if(err) throw err;
                        return done(null, data);
                    });
                }
            });
        });
    }));
 */
    passport.use('login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
        var query= {email};

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        adminModel.findOne(query, (err, user) => {
            // if there are any errors, return the error before anything else
            if (err) return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'NO USER FOUND!!!')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'OOPS... Wrong Password:-]')); // create the loginMessage and save it to session as flashdata

            return done(null, user);
        });
    }));

    /*============================
        STRATEGIES END
    ============================*/
};