"use strict";
//Required modules
const moment    = require('moment');
const urlModule = require('url');
const request   = require('request');
const csv       =require('csvtojson')
const fs        = require('fs');
const FCM       = require('fcm-push');
const fcm       = new FCM('AIzaSyCMB1Wu8DSIVMnHAnn9jA3lrS7uhNLuDvc');

// load up the user model
const Model  = require('./../user/user');
const config = require('./../config/config');
const profile= require('./profile');
const email  = require('./../scripts/email');

const { leagueModel, teamModel, gameModel, likeModel, userModel, gameInOutModel, userStatusModel, alertModel,
        courtModel, adminModel, rewardModel, authTokenModel, adminHierarchyModel, invitedUserModel } = Model;

const defaultFailureStatus= { code: 500, error: '', message: "Failure" };
const defaultSuccessStatus= { code: 200, error: '', message: "Success" };

function sendNotification(receiver, msg, type, title= "PQApp") {
    const message = {
      to: receiver.notification_id,
      collapse_key: 'my_collapse_key',
      priority: 'high',
      data: {
        from_user: receiver._id,
        from_username: receiver.name,
        message: msg,
        title,
        type
      }
    };
    if (receiver.device_type.toUpperCase() === 'IOS') {
      message.notification = {
        title,
        body: msg,
        "sound": "default"
      };
    }
    fcm.send(message, (err, res) => {
      if (err) {
        console.log('err: ',
          err);
        console.log('res: ',
          res);
        console.log(
          'Something has gone wrong!'
        );
      } else {
        console.log(
          'Successfully sent with response: ',
          res);
      }
    });
}

const getAlertStartTimestamp= (time_minutes, day) => {
    let dateByWeekDay, hours, minutes, today = new Date();

    //Little trick to get current / future date by week day number 0-6
    dateByWeekDay= new Date( today.setDate( today.getDate() + ( day + (7-today.getDay())) % 7 ) );

    //Trick to get timestamp by minutes and date by dateByWeekDay
    hours= Math.floor(time_minutes / 60);
    minutes= time_minutes % 60;
    return new Date(dateByWeekDay.getFullYear(), dateByWeekDay.getMonth(), dateByWeekDay.getDate(), hours, minutes, 0);
};

const redirect = (res, pathname, query) => {
    res.redirect(urlModule.format({
        pathname, query
    }));
}

function sortData(data, field, sort) {
    if( field && sort ) {
        if(sort === "asc") {
            data.sort( (a, b) => {
                let nameA=a[field], nameB=b[field]
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
        }
        else {
            data.sort( (a, b) => {
                let nameA=a[field], nameB=b[field]
                if (nameA > nameB) return -1;
                if (nameA < nameB) return 1;
                return 0;
            });
        }
    }
    return data;
}

function getArrayFromCSVContent(csvPath) {
    return new Promise((resolve, reject) => {
        let jsonArray= [];
        csv()
        .fromFile(csvPath)
        .on('json',(jsonObject)=>{
            jsonArray.push(jsonObject);
        })
        .on('done',(error)=>{
            fs.unlink(csvPath, (err) => {
                if (err) console.log(err);
            });

            if(error) reject(err);
            else resolve(jsonArray);
        })
    });
}

function saveTeams(teams, league) {
    return new Promise((resolve, reject) => {
        let owner_email_ids= teams.map(t => t.owner_email);

        let query= {
            "$or": [{
                "email": {"$in": owner_email_ids }
            },{
                "phone": {"$in": owner_email_ids }
            }]
        };
        userModel.find(query)
        .then( users =>{

            teams.forEach( team => {
                let hours_preference= team.hours_preference.split(",");
                team.hours_preference= (hours_preference.length)
                ? hours_preference.map( h => +h )
                : [];

                let user = users.find( u => u.email === team.owner_email );
                if(user) team.owner_id= user._id+'';

                team.cost= +team.cost || 0;
                team.league_id= league._id+'';
                team.league_name= league.name;
            });
            teamModel.insertMany(teams)
            .then( result => {
                resolve(result);
            })
            .catch( error => {
                reject(error);
            });
        })
        .catch( error => {
            reject(error);
        });
    });
}

function saveTeamsByCSV(league, req) {
    return new Promise((resolve, reject) => {
        getArrayFromCSVContent(req.files.teamcsv[0].path)
        .then( teams => {
            saveTeams(teams, league)
            .then( result => {
                resolve(result);
            })
            .catch( error => {
                reject(error);
            });
        })
        .catch( error => {
            reject(error);
        });
    });
}

function newGameNotificationToAllUsers(team_id) {
    let userIds= [], msg= "New Game is their. Check it out";

    teamModel.find({_id: team_id}).lean().exec( (err, teams) => {
        if(teams && teams.length) {
            teams.forEach( team => {
                if(team.member_ids && team.member_ids.length) {
                    team.member_ids.forEach( member => {
                        if(!~userIds.indexOf(member.user_id)) userIds.push(member.user_id);
                    });
                }
            });
            if(userIds.length) {
                userModel.find({_id: {"$in": userIds}, "settings.basketball_synch": true}).lean().exec( (err, users) => {
                    users.forEach( user => {
                        sendNotification(user, msg, "new_game_added_to_your_team");
                    });
                });
            }
        }
    });
}

function redirectToLogin(req, res) {
    req.logout();
    redirect(res, '/admin/login', {});
    return;
}

function getAdminsByIdsInArrayObjects(arrayOfObjects) {
    return new Promise((resolve, reject) => {
        let admin_ids= []
        arrayOfObjects.forEach( obj => {
            if(obj.id_created_by) admin_ids.push(obj.id_created_by);
        });
        
        adminModel.find({"_id":{"$in": admin_ids}}).lean().exec((err, admins) => {
            if(err) reject(err);
            else resolve(admins);
        });
    });
}

function getAdminHierarchy() {
    return new Promise((resolve, reject) => {
        adminHierarchyModel.find({}).lean().exec((err, adminHierarchy) => {

            if(err) {
                console.log(err);
                reject(err);
            }
            else {
                //making result as {type:priority}, eg- {"admin":1}, to make comparison easy
                let priorityHierarchy={};
                adminHierarchy.forEach( hierarchy => {
                    priorityHierarchy[hierarchy.type]= hierarchy.priority;
                });
                resolve(priorityHierarchy);
            }
        });
    });
}

function getGames(query, type, fieldgame, sortgame) {

    return new Promise((resolve, reject) => {
        getAdminHierarchy()
        .then(hierarchy => {

            gameModel.find( query ).lean().exec((err, games) => {
                if(err) {
                    console.log(err);
                    resolve([]);
                }
                else {
                    getAdminsByIdsInArrayObjects(games)
                    .then( admins => {
                        games.forEach( game => {
                            game.can_modify= true;
                            if(game.id_created_by) {
                                let admin= admins.find( admin => admin._id == game.id_created_by);
                                if( admin && hierarchy[type] > hierarchy[admin.type] ) game.can_modify= false;
                            }
                        });

                        games= sortData(games, fieldgame, sortgame);
                        resolve(games);
                    })
                    .catch( error => {
                        console.error(error);
                        resolve([]);
                    });
                }
            });
        });
    })
    .catch( error => {
        console.error(error);
        resolve([]);
    });
}

function getPlayers(team_id, fieldmem, sortmem) {
    return new Promise((resolve, reject) => {
        teamModel.findOne({"_id": team_id}).lean().exec((err, team) => {
            if(err) console.log(err);

            let member_ids= team.member_ids.map( member => member.user_id );
            if( member_ids && member_ids.length ) {
                userModel.find({"_id": {"$in": member_ids}}).lean().exec((err, members) => {
                    if(err) console.log(err);

                    if(fieldmem && sortmem) members= sortData(members, fieldmem, sortmem);

                    resolve(members);
                });
            }
            else resolve([]);
        });
    });
}

function saveMembersInTeam(users, token, team_id) {
    return new Promise((resolve, reject) => {
        let member_ids=[];

        teamModel.findById(team_id).lean().exec((err, team) => {
            if(err) console.log(err);

            if(team) {
                users.forEach( user => {
                    let is_member= ~team.member_ids.findIndex( member => member.user_id == user._id);
                    if(!is_member) {
                        member_ids.push({
                            id_created_by: token,
                            user_id: user._id
                        });
                    }
                });

                if(member_ids.length) {
                    let update= {
                        "$push": {
                            "member_ids": {
                                "$each": member_ids
                            }
                        }
                    };

                    teamModel.update({ "_id": team_id }, update, (err, data) => {
                        if(err) {
                            console.log(err);
                            reject(err);
                        }
                        resolve('');
                    });
                }
                else resolve('');
            }
            else resolve('');
        });
    });
}

function sendEmailInvitation(emailId, team_id) {

    let reason  = "You have been added to a Basketball League using PQApp. To view the complete schedule of games for your team, please download PQApp.";

    let subject= 'Basketball League';

    teamModel.findOne({"_id": team_id}).lean().exec((err, team) => {
        if(err) console.log(err);

        leagueModel.findOne({"_id": team.league_id}).lean().exec((err, league) => {
            if(err) console.log(err);

            //Prepare HTML body
            let html = "<h2>Basketball League:</h2>\
            <p>The league manager for <b>"+league.name+"</b> basketball league has added you to <b>"+team.name+"</b> team using PQApp. Please download PQApp on iOS or Android from the links below to view and manage the complete schedule of your games.</p>\
            <p>Good luck for the league.</p>\
            <p>PQApp - It's a Basketball Lifestyle</p>";

            email(emailId, subject, reason, html);
        });
    });
}

function saveInvitedUser(email, phone, team_id, token) {
    let query= {
        "$or": [],
        team_id
    };
    if(email) query["$or"].push({email});
    if(phone) query["$or"].push({phone});
    let update= {
        "$set": { phone },
        "$setOnInsert": {
            "id_created_by": token,
            team_id,
            email
        }
    };
    invitedUserModel.update(query, update, {upsert: true}).exec( (err, result) => {
        if(err) console.log(err);
    });
    return;
}

function saveMembersInInvitedUsers(users, emails, phone, token, team_id) {
    let emailsToSendInvitations= [];
    return new Promise( (resolve, reject) => {

        emails.forEach( email => {
            let user= (users.length)
                ? ~users.findIndex(user => user.email === email)
                : '';

            if(!user) {
                emailsToSendInvitations.push(email);

                saveInvitedUser(email, phone, team_id, token);
            }
        });
        resolve(emailsToSendInvitations);
    });
}

function saveMembers(users, emails, phone, token, team_id) {
    return new Promise((resolve, reject) => {

        saveMembersInInvitedUsers(users, emails, phone, token, team_id)
        .then(emailsToSendInvitations => {

            if(emailsToSendInvitations.length)
                sendEmailInvitation(emailsToSendInvitations+'', team_id);

            if(users.length) {
                saveMembersInTeam(users, token, team_id)
                .then(result => {
                    resolve('');
                })
                .catch(err => {
                    reject(err);
                });
            }
            else resolve('');
        })
        .catch(err => {
            reject(err);
        });
    });
}

module.exports= {

    insertLeagueTempelate: (req, res) => {
        res.render('addLeagues', {"token": req.query.token, "type": req.query.type});
    },

    //admin starts
    insertLeague: (req, res) => {
        let { name= '' } = req.body;

        if(req.files.leaguecsv && req.files.leaguecsv[0].path) {

            getArrayFromCSVContent(req.files.leaguecsv[0].path)
            .then( leagues => {
                leagueModel.insertMany(leagues)
                .then( result => {
                    let ids= result.map( r => r._id+'' );
                    profile.insertid(req.query.type, req.query.token, ids);
                    redirect(res, '/admin/leagues', req.query);
                })
                .catch( error => {
                    console.log(error);
                    redirect(res, '/admin/leagues', req.query);
                });
            })
            .catch( error => {
                console.log(error);
                redirect(res, '/admin/leagues', req.query);
            });
        }
        else {
            if( name ) {
                leagueModel.find({ name }, (err, leagues) => {
                    if(leagues.length === 0) {
                        let leagueRef = leagueModel();
                        leagueRef.name = name;
                        leagueRef.logo= (req.file && req.file.logo) ? req.file.logo[0].filename : '';

                        // save the user
                        leagueRef.save(function(err, result) {
                            if (err) console.log(err);
                            else profile.insertid(req.query.type, req.query.token, [result._id+'']);

                            redirect(res, '/admin/leagues', req.query);
                        });
                    }
                    else redirect(res, '/admin/leagues', req.query);
                });
            }
            else redirect(res, '/admin/leagues', req.query);
        }
    },

    updateLeague: (req, res) => {
        let { league_id= '', name= '' } = req.body;

        let body = {};
        if(name) body.name= name;
        if(req.file) body.logo= req.file.filename;

        leagueModel.update({ _id: league_id }, { "$set": body }, function(err, data) {
            if(err) console.log(err);

            redirect(res, '/admin/leagues', req.query);
        });
    },

    leagues: (req, res) => {
        let league_id = req.query.league_id || '';
        let sort      = req.query.sort || '';
        let query= {}, tempelate= "leagues";

        if(league_id) {
            query._id= league_id;
            tempelate= "editLeague";
        }

        profile.getProfile(req.query.token).then( admin => {

            if( admin.type === "league_manager" && !league_id ) query["_id"] = { "$in": admin.league_ids };

            leagueModel.find(query).lean().exec( (err, data) => {
                if(err) console.log(err);

                if(sort) data= sortData(data, 'name', sort);
                res.render(tempelate, {"token": req.query.token, "type": req.query.type, data, sort});
            });
        });
    },

    teams: (req, res) => {
        let {league_id= '', team_id= '', field= '', sort= ""}= req.query;
        let query= {league_id}, tempelate= "teams", teamOwners;

        if(team_id) {
            query= {"_id": team_id};
            tempelate= "editTeam";
        }

        let userIds, user;

        profile.getProfile(req.query.token).then( admin => {

            if( admin.type === "team_manager" && !team_id ) query = {"_id": {"$in": admin.team_ids}};

            teamModel.find(query).lean().exec((err, data) => {
                if(err) console.log(err);
    
                if(data.length) {
                    userModel.find({}).lean().exec( (err, users) => {
                        if(err) console.log(err);

                        leagueModel.find({}).lean().exec( (err, leagues) => {
                            data.forEach( team => {
                                user= users.find( u => u._id+'' === team.owner_id );

                                team.owner_name= (user && user.name) ? user.name : '';

                                team.owner_email= (user && user.email) ? user.email : '';

                                if(team.hours_preference && team.hours_preference.length && tempelate === "teams") {
                                    team.hours_preference= team.hours_preference.map( hp => ' '+hp+' hrs' );
                                }
                                team.primary_address= team.primary_address1 + " " + team.primary_address2;
                                if(!team.primary_address1 && !team.primary_address1) team.primary_address= '';
                            });

                            if(field && sort) data= sortData(data, field, sort);

                            res.render(tempelate, {"token": req.query.token, "type": req.query.type, league_id, data, users, leagues, field, sort});
                        });
                    });
                }
                else res.render(tempelate, {"token": req.query.token, "type": req.query.type, league_id, data: [], users: [], leagues: [], field, sort});
            });
        });
    },

    teamsAddTempelate: (req, res) => {
        userModel.find({ name: { "$ne": '' } }).lean().exec( (err, users) => {
            if(err) console.log(err);

            res.render('addTeam', {"token": req.query.token, "type": req.query.type, league_id: req.query.league_id, users});
        });
    },

    addTeam: (req, res) => {
        let { name= '', cost= '', primary_address1= '', primary_address2= '', owner= '',
        league_id= '', hours_preference= [], old_league_id= '' } = req.body;

        let query= { _id: league_id };
        leagueModel.findOne(query).lean().exec( (err, league) => {

            if(old_league_id) req.query.league_id= old_league_id;
            else req.query.league_id= league_id;

            if(req.files.teamcsv && req.files.teamcsv[0].path) {
                saveTeamsByCSV(league, req)
                .then( result => {
                    let ids= result.map( r => r._id+'' );
                    profile.insertid(req.query.type, req.query.token, ids);
                    redirect(res, '/admin/teams', req.query);
                })
                .catch( error => {
                    console.log(error);
                    redirect(res, '/admin/teams', req.query);
                });
            }
            else {
                let team_image= (req.file && req.file.team_image) ? req.file.team_image[0].filename : '';

                let query= {"$or": [{email: owner}, {phone: owner}]};
                userModel.count(query, (err, count) => {

                    if(err) console.log(err);
                    if(count) {
                        let team= {
                            "owner_email": owner,
                            hours_preference: hours_preference+'',
                            cost,
                            name,
                            primary_address1,
                            primary_address2,
                            team_image
                        };

                        saveTeams([team], league)
                        .then( result => {
                            profile.insertid(req.query.type, req.query.token, [result[0]._id+'']);

                            redirect(res, '/admin/teams', req.query);
                        })
                        .catch( error => {
                            console.log(error);
                            redirect(res, '/admin/teams', req.query);
                        });
                    }
                    else redirect(res, '/admin/teams', req.query);
                });
            }
        });
    },

    updateTeam: (req, res) => {
		
        let { name= '', cost= '', primary_address1= '', primary_address2= '', owner= '', team_id= '',
              league_id= '', hours_preference= [], old_league_id= '' } = req.body;
         
       let set= {}, query= {};
        if(name)                                 set.name= name;
        if(cost)                                 set.cost= +cost;
        if(primary_address1)                     set.primary_address1= primary_address1;
        if(primary_address2)                     set.primary_address2= primary_address2;
        if(typeof hours_preference === "object") set.hours_preference= hours_preference.map( h => +h );
        if(typeof hours_preference === "string") set.hours_preference= [+hours_preference];
        if(league_id) {
            set.league_id= league_id;
            query._id= league_id;
        }

        leagueModel.findOne(query).lean().exec( (err, league) => {

            if(err) console.log(err);
		     
            
            userModel.findOne({"email": owner}).lean().exec( (err, user) => {
                if(err) console.log(err);
				 
                                                                
                if(owner && user) set.owner_id= user._id+'';   // set={owner_id:user_id}

                if(league_id && league) set.league_name= league.name;  // set={owner_id:user_id,league_name:league.name}

                if(req.file) set.team_image= req.file.filename;  
				// set={owner_id:user_id,league_name:league.name,team_image:req.file.name}

                let update= {$set: set};
                
                query= { "_id": team_id };
                teamModel.findOneAndUpdate( query, update, {new: true}).lean().exec((err, update) => {
                    if (err) throw err;
					
                   
                    if(old_league_id) req.query.league_id= old_league_id;
                    else req.query.league_id= league_id;
                      console.log(req.query); 
                    redirect(res, '/admin/teams', req.query);
					
                }); 
            }); 
        }); 
    },

    teamGames: (req, res) => {
        let {team_id= '', game_id= '', fieldgame= 'created_at', sortgame= 'desc', fieldmem= '', sortmem= ''} = req.query;

        let tempelate= "gamesAndMembers", gameQuery= { team_id };

        if(game_id) {
            gameQuery= { "_id": game_id };
            tempelate= "editGame";
        }

        let gamesPromise= getGames(gameQuery, req.query.type, fieldgame, sortgame);

        let playersPromise= getPlayers(team_id, fieldmem, sortmem);

        Promise.all([gamesPromise, playersPromise])
        .then( result => {
            res.render(tempelate, {"token": req.query.token, "type": req.query.type, "league_id": req.query.league_id, "team_id": req.query.team_id, games: result[0], members: result[1], fieldgame, sortgame, fieldmem, sortmem});
        })
        .catch( error => {
            console.error(error);
            res.render(tempelate, {"token": req.query.token, "type": req.query.type, "league_id": req.query.league_id, "team_id": req.query.team_id, games: [], members: [], fieldgame, sortgame, fieldmem, sortmem});
        });
    },

    insertGameTempelate: (req, res) => {
        res.render('addGame', req.query);
    },

    insertGame: (req, res) => {
        let { address= '', start_timestamp= '', end_timestamp= '', offset= 0, defaultAddress= "no" } = req.body;

        let team_id= req.query.team_id;

        newGameNotificationToAllUsers(team_id);

        if(req.file) {
            getArrayFromCSVContent(req.file.path)
            .then( games => {
                games.forEach(game => {
                    if(game.start_timestamp) {
                        game.start_timestamp = new Date(game.start_timestamp);
                        game.start_timestamp.setMinutes(game.start_timestamp.getMinutes() + Number(offset));
                    }

                    if(game.end_timestamp) {
                        game.end_timestamp = new Date(game.end_timestamp);
                        game.end_timestamp.setMinutes(game.end_timestamp.getMinutes() + Number(offset));
                    }
                    game.team_id= team_id;
                    game.id_created_by= req.query.token;
                });
                gameModel.insertMany(games)
                .then( result => {
                    redirect(res, '/admin/gamesandmembers', req.query);
                })
                .catch( error => {
                    console.log(error);
                    redirect(res, '/admin/gamesandmembers', req.query);
                });
            })
            .catch( error => {
                console.log(error);
                redirect(res, '/admin/gamesandmembers', req.query);
            });
        }
        else {
            teamModel.findOne({"_id": team_id}).lean().exec((err, team) => {
                if(err) console.log(err);

                if(team && defaultAddress === "yes") {
                    address= team.primary_address1 + team.primary_address2;
                }

                let gameRef = gameModel();
                gameRef.address         = address;
                gameRef.start_timestamp = new Date(start_timestamp);
                gameRef.end_timestamp   = new Date(end_timestamp);
                gameRef.team_id         = team_id;
                gameRef.id_created_by   = req.query.token;

                // save the user
                gameRef.save(function(err, result) {
                    if (err) throw err;

                    redirect(res, '/admin/gamesandmembers', req.query);
                });
            });
        }
    },

    updateGame: (req, res) => {
        let { status= '', game_id= '', address= '', start_timestamp= '', end_timestamp= '' } = req.body;

        let body;
        if(game_id) {
            body = {};

            if(status) {
                body.status= status;
                body.has_won= status === "Won";
            }
            if(address) body.address= address;
            if(start_timestamp) body.start_timestamp= new Date(start_timestamp);
            if(end_timestamp) body.end_timestamp= new Date(end_timestamp);

            gameModel.findOneAndUpdate({ _id: game_id }, { "$set": body }, function(err, data) {
                if(err) console.log(err);

                redirect(res, '/admin/gamesandmembers', req.query);
            });
        }
        else {
            redirect(res, '/admin/gamesandmembers', req.query);
        }
    },

    deleteGame: (req, res) => {
        gameModel.remove({_id: req.query.game_id}, (err, body) => {
            if(err) console.log(err);

            delete req.query.game_id;

            redirect(res, '/admin/gamesandmembers', req.query);
        });
    },

    getMembers: (req, res) => {
        let {team_id= '', ajax= false, search= ''} = req.query;

        teamModel.findOne({_id: team_id}).lean().exec((err, team) => {

            let query= {};

            if(ajax && search) {
                query["$or"]= [
                    {name: { $regex: search, $options: 'im' }},
                    {email: { $regex: search, $options: 'im' }}
                ];
            }
            userModel.find(query).lean().exec((err, users) => {

                let have_users= ajax && search && team && team.member_ids && team.member_ids.length;
                if(have_users) {

                    getAdminHierarchy()
                    .then(hierarchy => {

                        getAdminsByIdsInArrayObjects(team.member_ids)
                        .then( admins => {

                            users.forEach( user => {
                                user.member= false;
                                user.can_modify= true;
                            });

                            team.member_ids.forEach( member => {
                                let user= users.find( u => u._id == member.user_id );

                                if(user) {
                                    user.member= true;

                                    let admin= admins.find( admin => admin._id == member.id_created_by);
                                    if( admin && hierarchy[req.query.type] > hierarchy[admin.type] )
                                        user.can_modify= false;
                                }
                            });

                            if(ajax) res.json(users);
                            else res.render("addMembers", {"token": req.query.token, "type": req.query.type, "league_id": req.query.league_id, "team_id": req.query.team_id, users});
                        })
                        .catch( error => {
                            console.error(error);
                            res.render("addMembers", {"token": req.query.token, "type": req.query.type, "league_id": req.query.league_id, "team_id": req.query.team_id, users});
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.render("addMembers", {"token": req.query.token, "type": req.query.type, "league_id": req.query.league_id, "team_id": req.query.team_id, users});
                    });
                }
                else {
                    if(ajax && search) res.json(users);
                    else res.render("addMembers", {"token": req.query.token, "type": req.query.type, "league_id": req.query.league_id, "team_id": req.query.team_id, users:[]});
                }
            });
        });
    },

    toggleTeamMember: (req, res) => {
        let { user_id, team_id }= req.query;
        teamModel.findOne({"_id": team_id}).lean().exec((err, data) => {
            if(err) console.log(err);
            if(data) {
                let update= {};
                let is_pull= ~data.member_ids.findIndex( member => member.user_id === user_id );
                if(is_pull) {
                    update["$pull"]= {
                        "member_ids": {
                            user_id
                        }
                    };
                }
                else {
                    update["$push"]= {
                        "member_ids": {
                            id_created_by: req.query.token,
                            user_id
                        }
                    };
                }

                teamModel.findOneAndUpdate({ "_id": team_id }, update, (err, data) => {
                    if(err) console.log(err);

                    if(data) res.json({status: defaultSuccessStatus, data: []});
                    else res.json({status: defaultFailureStatus, data: []});
                });
            }
            else res.json({status: defaultFailureStatus, data: []});
        });
    },

    playersByCSVTempelate: (req, res) => {
        res.render('addPlayers', req.query);
    },

    playersByCSV: (req, res) => {
        if(req.file) {
            getArrayFromCSVContent(req.file.path)
            .then( players => {
                let csv_emails= players.map( p => p.email );

                if(csv_emails.length) {

                userModel.find({"email": {"$in": csv_emails}}, {"_id": 1, "email": 1})
                .then( users => {
                        saveMembers(users, csv_emails, '', req.query.token, req.query.team_id)
                        .then( users => {
                            redirect(res, '/admin/gamesandmembers', req.query);
                        })
                        .catch( error => {
                            console.log(error);
                            redirect(res, '/admin/gamesandmembers', req.query);
                        });
                    })
                    .catch( error => {
                        console.log(error);
                        redirect(res, '/admin/gamesandmembers', req.query);
                    });
                }
                else redirect(res, '/admin/gamesandmembers', req.query);
            })
            .catch( error => {
                console.log(error);
                redirect(res, '/admin/gamesandmembers', req.query);
            });
        }
        else redirect(res, '/admin/gamesandmembers', req.query);
    },

    assignLeague: (req, res) => {
        let {league_id= '', ajax= false, search= ''} = req.query;

        let query= { type: "league_manager" };

        if(ajax) {
            query["$or"]= [
                {name: { $regex: search, $options: 'im' }},
                {email: { $regex: search, $options: 'im' }}
            ];
        }
        adminModel.find(query).lean().exec((err, admins) => {

            admins.forEach( user => {
                if(~user.league_ids.indexOf(league_id)) user.member= true;
                else user.member= false;
            });
            if(ajax) res.json(admins);
            else res.render("assignLeague", {"token": req.query.token, "type": req.query.type, "league_id": league_id, admins});
        });
    },

    assignTeam: (req, res) => {
        let {team_id= '', ajax= false, search= ''} = req.query;

        let query= { type: "team_manager" };

        if(ajax) {
            query["$or"]= [
                {name: { $regex: search, $options: 'im' }},
                {email: { $regex: search, $options: 'im' }}
            ];
        }
        adminModel.find(query).lean().exec((err, admins) => {

            admins.forEach( user => {
                if(~user.team_ids.indexOf(team_id)) user.member= true;
                else user.member= false;
            });
            if(ajax) res.json(admins);
            else res.render("assignTeam", {"token": req.query.token, "type": req.query.type, team_id, "league_id": req.query.league_id, admins});
        });
    },

    toggleLeagueAssign: (req, res) => {
        let { admin_id, league_id }= req.query;
        adminModel.findOne({"_id": admin_id}).lean().exec((err, data) => {
            if(err) console.log(err);
            if(data) {
                let update= {};
                if(data.league_ids && ~data.league_ids.indexOf(league_id)) update["$pull"]= { league_ids: league_id };
                else update["$push"]= { league_ids: league_id };

                adminModel.findOneAndUpdate({ "_id": admin_id }, update, (err, data) => {
                    if(err) console.log(err);

                    if(data) res.json({status: defaultSuccessStatus, data: []});
                    else res.json({status: defaultFailureStatus, data: []});
                });
            }
            else res.json({status: defaultFailureStatus, data: []});
        });
    },

    toggleTeamAssign: (req, res) => {
        let { admin_id= '', team_id= '', league_id= '' }= req.query;
        adminModel.findOne({"_id": admin_id}).lean().exec((err, data) => {
            if(err) console.log(err);
            if(data) {
                let update= {};
                if(data.team_ids && ~data.team_ids.indexOf(team_id)) update["$pull"]= { team_ids: team_id };
                else update["$push"]= { team_ids: team_id };

                adminModel.findOneAndUpdate({ "_id": admin_id }, update, (err, data) => {
                    if(err) console.log(err);

                    if(data) res.json({status: defaultSuccessStatus, data: []});
                    else res.json({status: defaultFailureStatus, data: []});
                });
            }
            else res.json({status: defaultFailureStatus, data: []});
        });
    },

    rewards: (req, res) => {
        let { reward_id= '', field= '', sort= '' }= req.query;
        let query= {}, tempelate= 'rewards';
        if(reward_id) {
            query._id= reward_id;
            tempelate= 'editReward';
        }

        rewardModel.find(query).lean().exec((err, rewards) => {
            if(err) console.log(err);

            rewards.forEach( reward => {
                if( tempelate === 'rewards' ) {
                    reward.created_at= moment(new Date(reward.created_at)).format("hh:mma DD MMM YY");
                    reward.expiry_date= moment(new Date(reward.expiry_date)).format("hh:mma DD MMM YY");
                }
                else reward.expiry_date= moment(new Date(reward.expiry_date)).format("YYYY-MM-DD HH:mm");
            });

            if(field && sort) rewards= sortData(rewards, field, sort);
            res.render(tempelate, {"token": req.query.token, "type": req.query.type, rewards, field, sort});
        });
    },

    addReward: (req, res) => {
        let { expiry_date= '', reward_points= '', redumption_limit= '', reward_url= '' }= req.body;
        let rewardRef= rewardModel();

        if(expiry_date) {
            rewardRef.expiry_date= (new Date(expiry_date)).setHours(23,59,59,999);
            rewardRef.reward_points= reward_points;
            rewardRef.redumption_limit= redumption_limit;
            rewardRef.reward_url= reward_url;

            if(req.files.reward_image) rewardRef.reward_image= req.files.reward_image[0].filename;
            if(req.files.redumption_image) rewardRef.redumption_image= req.files.redumption_image[0].filename;

            rewardRef.save((err, rewardResult) => {
                if(err) console.error(err);
                redirect(res, '/admin/rewards', req.query);
            });
        }
        else res.render('addReward', {"token": req.query.token, "type": req.query.type});
    },

    updateReward: (req, res) => {
        let { reward_id= '', expiry_date= '', reward_points= '', redumption_limit= '', reward_url= '' }= req.body;
        let query= {}, tempelate= 'rewards', body= {};
        if(reward_id) {
            query._id= reward_id;
            tempelate= 'editReward';
        }

        body.expiry_date= (new Date(expiry_date)).setHours(23,59,59,999);
        body.reward_points= reward_points;
        body.reward_url= reward_url;
        body.redumption_limit= redumption_limit;

        if(req.files.reward_image) body.reward_image= req.files.reward_image[0].filename;
        if(req.files.redumption_image) body.redumption_image= req.files.redumption_image[0].filename;

        rewardModel.findOneAndUpdate(query, {$set: body}).lean().exec((err, rewards) => {
            if(err) console.log(err);
            delete req.query.reward_id;

            redirect(res, '/admin/rewards', req.query);
        });
    },

    deleteReward: (req, res) => {
        let {reward_id}= req.query;

        rewardModel.remove({_id: reward_id}, (err, deleteResult) => {
            if(err) console.error(err);

            delete req.query.reward_id;
            redirect(res, '/admin/rewards', req.query);
        });
    },

    insertCourt: (req, res) => {
        if(req.method.toUpperCase() === 'POST') {
        let { name = '', address = '', lights, opening_time = 0, closing_time = 0, cost = 0, long = 0,
              lat = 0 } = req.body;

            let url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${long}&timestamp=${moment().unix()}&key=${config.googlePlaces}`;
            request(url, function(error, response, timezoneOffset) {

                timezoneOffset = JSON.parse(timezoneOffset);
                let courtRef = courtModel({ location: { coordinates: [] } });

                if(name) courtRef.name = name;
                if(cost) courtRef.cost = cost;
                if(address) courtRef.address = address;
                if(lights) courtRef.lights = lights;
                if(long && lat) courtRef.location.coordinates = [+long, +lat];
                courtRef.offset_mins= timezoneOffset.rawOffset/60;
                courtRef.time_zone_id= timezoneOffset.timeZoneId;
                courtRef.image= (req.file) ? req.file.filename : '';
                courtRef.source = "local";

                if(closing_time) {
                    closing_time= closing_time.split(':');
                    if(closing_time.length === 2) courtRef.closing_time_mins = +closing_time[0] * 60 + +closing_time[1];
                }
                else courtRef.closing_time_mins= 0;

                if(opening_time) {
                    opening_time= opening_time.split(':');
                    if(opening_time.length === 2) courtRef.opening_time_mins = +opening_time[0] * 60 + +opening_time[1];
                }
                else courtRef.opening_time_mins= 0;

                courtRef.opening_time_mins_utc= courtRef.opening_time_mins - courtRef.offset_mins;
                if( courtRef.opening_time_mins_utc < 0 ) courtRef.opening_time_mins_utc += 1440;

                if( courtRef.opening_time_mins_utc > 1440 ) courtRef.opening_time_mins_utc -= 1440;

                courtRef.closing_time_mins_utc= courtRef.closing_time_mins - courtRef.offset_mins;
                if( courtRef.closing_time_mins_utc < 0 ) courtRef.closing_time_mins_utc += 1440;

                if( courtRef.closing_time_mins_utc > 1440 ) courtRef.closing_time_mins_utc -= 1440;

                // save the user
                courtRef.save(function(err, result) {
                    if (err)
                        throw err;

                    res.render('addCourt', {"token": req.query.token, "type": req.query.type, message:"SUCCESS"});
                });
            });
        }
        else res.render('addCourt', {"token": req.query.token, "type": req.query.type, message:""});
    },

    updateErikbergToken: (req, res) => {
        let { token_id= "", token= "" }= req.body;
        authTokenModel.findOne({"type": "erikberg"})
        .then( authToken => {
            if(token_id && token) {
                authTokenModel.findOneAndUpdate({"_id": token_id}, {"$set": {token: token.trim()}}, {new:true})
                .then( authToken  => {
                    res.render('editErikbergToken', {"token": req.query.token, "type": req.query.type, data: authToken});
                })
                .catch(err => {
                    console.log(err);
                    res.render('editErikbergToken', {"token": req.query.token, "type": req.query.type, data: authToken});
                });
            }
            else res.render('editErikbergToken', {"token": req.query.token, "type": req.query.type, data: authToken});
        })
        .catch(err => {
            console.log(err);
            res.render('editErikbergToken', {"token": req.query.token, "type": req.query.type, data: authToken});
        });
    },

    sendNotificationToTeamsTempelate: (req, res) => {
        let {token= "", type= ''}= req.query;
        if(token) {
            adminModel.findOne({"_id": token}).lean()
            .then(admin => {
                if(admin) {
                    let query = {};
                    if(admin.type !== "admin") {
                        query["$or"]= [{
                            "_id": {"$in": admin.team_ids}
                        },{
                            "league_id": {"$in": admin.league_ids}
                        }];
                    }
                    teamModel.find(query).lean()
                    .then(teams => {

                        if(admin.type !== "admin") query= {"_id": teams.map( t => t.league_id)};

                        if(admin.type !== "team_manager") {
                            teams= teams.filter( team => ~admin.team_ids.indexOf(team._id+'') );
                        }

                        leagueModel.find(query).lean()
                        .then(leagues => {
                            leagues.forEach( league => {
                                league.teams= teams.filter( team => team.league_id == league._id+'');
                            });
                            res.render('sendTeamNotification', {"token": req.query.token, "type": req.query.type, data: leagues});
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        redirectToLogin(req, res);
                    });;
                }
                else redirectToLogin(req, res);
            })
            .catch(err => {
                console.log(err);
                redirectToLogin(req, res);
            });
        }
        else redirectToLogin(req, res);
    },

    sendNotificationToTeams: (req, res) => {
        let {league_ids= '', team_ids= '', message= '', title= 'PQApp'}= req.body;

        if( league_ids || team_ids ) {

            adminModel.findOne({"_id": req.query.token}).lean()
            .then(admin => {
                if( league_ids && typeof league_ids === "String" ) league_ids= [league_ids];
                if( team_ids && typeof team_ids === "String" ) team_ids= [team_ids];

                let query= { "$or": [] };
                if(team_ids && team_ids.length) query["$or"].push({ "_id": {"$in": team_ids} });
                if(league_ids && league_ids.length) query["$or"].push({ "league_id": {"$in": league_ids} });

                if(admin.type === "team_manager") query._id= {"$in": admin.team_ids};
                teamModel.find(query).lean()
                .then( teams => {
                    let member_ids= [];
                    teams.forEach( team => {
                        if( team.member_ids.length ) member_ids= member_ids.concat(team.member_ids);
                    });

                    if(member_ids.length) {
                        member_ids= member_ids.map( member => member.user_id );
                        userModel.find({"_id": {"$in": member_ids}}).lean()
                        .then( users => {
                            users.forEach( user => {
                                sendNotification(user, message, "message_from_admin", title);
                                redirect(res, '/admin/send/notification', req.query);
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            redirect(res, '/admin/send/notification', req.query);
                        });
                    }
                    else {
                        redirect(res, '/admin/send/notification', req.query);
                    }
                });
            })
            .catch(err => {
                console.log(err);
                redirect(res, '/admin/send/notification', req.query);
            });
        }
        else {
            redirect(res, '/admin/send/notification', req.query);
        }
    },

    addPlayer: (req, res) => {
        let {email= '', phone='', team_id= ''}= req.body;

        req.query.team_id= team_id;

        let query= { "$or": [] };

        if(email) query["$or"].push({ email });
        if(phone) query["$or"].push({ phone });

        userModel.find(query).lean().exec((err, users) => {
            if(err) {
                console.log(err)
                redirect(res, '/admin/gamesandmembers', req.query);
            }
            else {

                let user= [];
                if(users.length) {
                    user= ( users.length === 2 )
                        ? [users.find( u => u.email === email )]
                        : [users[0]];
                }

                saveMembers(user, [email], phone, req.query.token, req.query.team_id)
                .then( users => {
                    redirect(res, '/admin/gamesandmembers', req.query);
                })
                .catch( error => {
                    console.log(error);
                    redirect(res, '/admin/gamesandmembers', req.query);
                });
            }
        });
    }
};