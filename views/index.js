"use strict";

// const jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
const multer    = require('multer');
const path      = require('path');
const urlModule = require('url');

// load up the user model
const Model      = require('./../user/user');
const profile    = require('./profile');
const controller = require('./controller');
const { adminModel } = Model;

/* Image Upload */
let allowedFileFilter = (req, file, cb) => {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|csv)$/)) {
        return cb(new Error('Only image and csv files are allowed!'), false);
    }
    cb(null, true);
};

// For profile pic
let storageLogo = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '/../../uploads/leagueAndTeam'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now()+"-"+file.originalname);
  }
});

// For Courts
let storageCourts = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '/../../uploads/courts'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now()+"-"+file.originalname);
  }
});

// for rewards
let storageRewards = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '/../../uploads/rewards'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now()+"-"+file.originalname);
  }
});

const uploadLeaguesTeams    = multer({ storage: storageLogo, fileFilter: allowedFileFilter });
const uploadCourts          = multer({ storage: storageCourts, fileFilter: allowedFileFilter });
const uploadRewards         = multer({ storage: storageRewards, fileFilter: allowedFileFilter });
/*Image Upload */

module.exports = function(router, passport) {

    router.get('/', (req, res) => {
        res.render("login");
    });

    router.get('/login', (req, res) => {
        res.render("login");
    });

    // process the login
    router.post('/login', (req, res, next) => {
        passport.authenticate('login', (err, user, info) => {
            if(err) console.log(err);
            if(!user) res.render("login");
            else {
                req.logIn(user, function(err) {
                    if(err) console.log(err);
                    
                    req.user= user;
                    if(user.type === "team_manager") {
                        // return the information including token as JSON
                        res.redirect(urlModule.format({
                            pathname: '/admin/teams',
                            query: {"token": user._id+'', "type": req.user.type}
                        }));
                    }
                    else {
                        res.redirect(urlModule.format({
                            pathname: '/admin/leagues',
                            query: {"token": user._id+'', "type": req.user.type}
                        }));
                    }

                });
            }
        })(req, res, next);
    });

    router.get('/logout', profile.logout);

    router.get('/league/manager/add', isAdminLoggedIn, profile.addLeaguesManagerTempelate);
    
    router.get('/team/manager/add', isAdminLoggedIn, profile.addTeamManagerTempelate);

    router.get('/addadmin', profile.addAdmin);

    router.post('/addsubadmin', isAdminLoggedIn, profile.addSubadmin);

    router.get('/league/manager/delete', isAdminLoggedIn, profile.deleteLeagueManager);

    router.get('/team/manager/delete', isAdminLoggedIn, profile.deleteTeamManager);

    // add leagues
    router.get('/league/add', isAdminLoggedIn, controller.insertLeagueTempelate);

    // add leagues
    router.post('/league/add', isAdminLoggedIn, uploadLeaguesTeams.fields([{
                                                    name: 'logo', maxCount: 1
                                                }, {
                                                    name: 'leaguecsv', maxCount: 1
                                                }]), controller.insertLeague);

    // edit leagues
    router.get('/updateleague', isAdminLoggedIn, controller.leagues);

    router.post('/updateleague', isAdminLoggedIn, uploadLeaguesTeams.single('logo'), controller.updateLeague);

    // get leagues
    router.get('/leagues', isAdminLoggedIn, controller.leagues);

    // get teams
    router.get('/teams', isAdminLoggedIn, controller.teams);

    // edit teams
    router.get('/team/edit', isAdminLoggedIn, controller.teams);

    // add teams
    router.get('/team/add', isAdminLoggedIn, controller.teamsAddTempelate);

    router.post('/team/add', isAdminLoggedIn, uploadLeaguesTeams.fields([{
                                                    name: 'team_image', maxCount: 1
                                                }, {
                                                    name: 'teamcsv', maxCount: 1
                                                }]), controller.addTeam);

   router.post('/team/upsert', isAdminLoggedIn, uploadLeaguesTeams.single('team_image'), controller.updateTeam);
    

  

    // add teams Tempelate
    router.get('/game/add', isAdminLoggedIn, controller.insertGameTempelate);

    // add teams
    router.post('/game/add', isAdminLoggedIn, uploadLeaguesTeams.single('gamecsv'), controller.insertGame);

    // edit teams
    router.get('/game/edit', isAdminLoggedIn, controller.teamGames);

    // edit teams
    router.post('/game/edit', isAdminLoggedIn, controller.updateGame);

    // Delete teams
    router.get('/game/delete', isAdminLoggedIn, controller.deleteGame);

    // get teams
    router.get('/gamesandmembers', isAdminLoggedIn, controller.teamGames);

    // Add Member
    router.get('/team/members/add', isAdminLoggedIn, controller.getMembers);

    // Add Member
    router.get('/team/member/toggle', isAdminLoggedIn, controller.toggleTeamMember);

    // Add Member
    router.get('/assign/league', isAdminLoggedIn, controller.assignLeague);

    // Assign member
    router.get('/league/assign/toggle', isAdminLoggedIn, controller.toggleLeagueAssign);

    // Add Member
    router.get('/assign/team', isAdminLoggedIn, controller.assignTeam);

    // Assign member
    router.get('/team/assign/toggle', isAdminLoggedIn, controller.toggleTeamAssign);

    router.get('/players/by/csv', isAdminLoggedIn, controller.playersByCSVTempelate);

    // Assign Players
    router.post('/players/by/csv', isAdminLoggedIn, uploadLeaguesTeams.single('playercsv'), controller.playersByCSV);

    // Get Rewards
    router.get('/rewards', isAdminLoggedIn, controller.rewards);

    // Tempelate to Edit Reward
    router.get('/reward/edit', isAdminLoggedIn, controller.rewards);

    // Add Reward
    router.all('/reward/add', isAdminLoggedIn, uploadRewards.fields([{
                                                name: 'reward_image', maxCount: 1
                                            }, {
                                                name: 'redumption_image', maxCount: 1
                                            }]), controller.addReward);

    // Edit Reward
    router.post('/reward/update', isAdminLoggedIn, uploadRewards.fields([{
        name: 'reward_image', maxCount: 1
    }, {
        name: 'redumption_image', maxCount: 1
    }]), controller.updateReward);

    // Delete Reward
    router.get('/reward/delete', isAdminLoggedIn, controller.deleteReward);

    // Add Court
    router.all('/court/add', isAdminLoggedIn, uploadCourts.single('image'), controller.insertCourt);

    // Edit erikberg token
    router.all('/token/update/erikberg', isAdminLoggedIn, controller.updateErikbergToken);

    //Send Notification
    router.get('/send/notification', isAdminLoggedIn, controller.sendNotificationToTeamsTempelate);

    router.post('/send/notification', isAdminLoggedIn, controller.sendNotificationToTeams);

    router.post('/player/add', isAdminLoggedIn, controller.addPlayer);
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        adminModel.findOne({_id: req.query.token}).lean().exec((err, user) => {
            req.user= user;
            return next();
        });
    }
    else res.render("login");
}

// route middleware to make sure a user is the admin that logged in
function isAdminLoggedIn(req, res, next) {
	
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        adminModel.findOne({_id: req.query.token}).lean().exec((err, user) => {
            if(user.type === "admin" || user.type === "league_manager" || user.type === "team_manager") {
                req.user= user;
                return next();
            }
            else res.render("login");
        });
    }
    else res.render("login");
}