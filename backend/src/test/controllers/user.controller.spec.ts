import jwt from 'jsonwebtoken';
import { User, UserAttributes } from './../../models/user.model';
import { applicationPromise } from './../../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';

chai.use(chaiHttp);
let app: Application;

const user1: UserAttributes = {
    userId: 1,
    admin: false,
    wallet: 500,
    userName: 'gandalf',
    password: '$2b$12$9yxV7TrHFID5bGdWJ8zBv.eSqHuSQYF8cxSR8yMknLz0RRkr2KwhC', // gandalf4ever
    userMail: 'gandalf@wizards.me',
    firstName: 'Gandalf',
    lastName: 'The Grey',
    gender: 'male',
    phoneNumber: 796554545,
    addressStreet: null,
    addressPin: null,
    addressCity: null,
    addressCountry: 'Middleearth',
    gameScore: 5,
    activityScore: 2,
    overallScore: 10
};
const adminUser: UserAttributes = {
    userId: 2,
    admin: true,
    wallet: 500,
    userName: 'admin',
    password: '$2b$12$XVwWZfAd2fjjd.QjrvMJXOh4WPuxJ4.tpNzkg9wpSSNOShAoDOYWC', // adminPW
    userMail: 'superAdmin@admins.com',
    firstName: 'Jack',
    lastName: 'Hammington',
    gender: 'male',
    phoneNumber: 796666666,
    addressStreet: null,
    addressPin: null,
    addressCity: null,
    addressCountry: 'England',
    gameScore: 5,
    activityScore: 4,
    overallScore: 20
};

describe('UserController Test', () => {
    before('init app', function(done) {
        applicationPromise.then(value => {
            app = value;
            done();
        });
    });
    describe('Test Register', () => {
        before('init', function(done) {
            User.create(user1).then(() => done());
        });
        it('should register successfully', function(done) {
            chai.request(app).post('/user/register').send({
                userName: 'frodo',
                password: 'F4Middle3rth',
                userMail: 'frodo@hobbits.me',
                firstName: 'Frodo',
                lastName: 'Baggins',
                gender: 'male',
                phoneNumber: '768885434',
                addressStreet: 'Brandy Hall',
                addressPin: '1',
                addressCity: 'Buckland',
                addressCountry: 'The Shire'
            }).end(function (err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(200);
                expect(res.body.admin).to.be.eq(false);
                expect(res.body.wallet).to.be.eq(500);
                expect(res.body.firstName).to.contain('Frodo');
                done();
            });
        });
        it('should return 400 when userName already exists', function(done) {
            chai.request(app).post('/user/register').send({
                userName: 'gandalf',
                password: 'hansii',
                userMail: 'hans@gmail.com',
                firstName: 'Hans',
                lastName: 'Ulrich',
                gender: 'male',
                phoneNumber: '0794443332',
                addressStreet: 'Hansenstrasse',
                addressPin: '13',
                addressCity: 'Mühlhausen',
                addressCountry: 'Hansingen'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(400);
                expect(res.body.message).to.contain('This username or email address is already being used!');
                done();
            });
        });
        it('should return 400 when email already exists', function(done) {
            chai.request(app).post('/user/register').send({
                userName: 'radagast',
                password: '4est',
                userMail: 'gandalf@wizards.me',
                firstName: 'Radagast',
                lastName: 'The Brown',
                gender: 'male',
                phoneNumber: '0791234567',
                addressStreet: 'Rhosgobel',
                addressPin: '',
                addressCity: 'Mirkwood',
                addressCountry: 'Middle-earth'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(400);
                expect(res.body.message).to.contain('This username or email address is already being used!');
                done();
            });
        });
        after('clean up', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true
            }).then(() => done());
        });
    });
    describe('Test login', () => {
        before('init db', function(done) {
            User.create(user1).then(() => done());
        });
        it('should login successfully with username when user registered', function(done) {
            chai.request(app).post('/user/login').send({
                userLogin: 'gandalf',
                password: 'gandalf4ever'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(200);
                expect(res.body.token).not.to.be.eq(null);
                expect(res.body.user.firstName).to.contain('Gandalf');
                done();
            });
        });
        it('should login successfully with email when user registered', function(done) {
            chai.request(app).post('/user/login').send({
                userLogin: 'gandalf@wizards.me',
                password: 'gandalf4ever'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(200);
                expect(res.body.token).not.to.be.eq(null);
                expect(res.body.user.firstName).to.contain('Gandalf');
                done();
            });
        });
        it('should not login when password wrong', function(done) {
            chai.request(app).post('/user/login').send({
                userLogin: 'gandalf@wizards.me',
                password: 'gandever'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(400);
                expect(res.body.message).to.contain('Wrong password');
                done();
            });
        });
        it('should not login when not registered', function(done) {
            chai.request(app).post('/user/login').send({
                userLogin: 'notRegisteredUser',
                password: 'heyImNotRegistered'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(400);
                done();
            });
        });
        after('clean up db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true
            }).then(() => done());
        });
    });
    describe('Test get all Users', () => {
        let token: string;
        before('init db and get valid token', function(done) {
            User.create(user1).then(() => {
                chai.request(app).post('/user/login').send({
                    userLogin: 'gandalf',
                    password: 'gandalf4ever'
                }).end(function(err, res) {
                    token = res.body.token;
                    done();
                });
            });
        });
        it('should return all users when valid token', function(done) {
            chai.request(app).get('/user/').set('Authorization', 'Bearer ' + token).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(200);
                expect(res.body[0].firstName).to.be.eq('Gandalf');
                done();
            });
        });
        it('should be forbidden to access without token', function(done) {
            chai.request(app).get('/user/').end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(403);
                expect(res.body.message).to.contain('Unauthorized');
                done();
            });
        });
        after('clean up db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true
            }).then(() => done());
        });
    });
    describe('Test delete user', () => {
        const userToDelete: UserAttributes = {
            userId: 3,
            admin: false,
            wallet: 500,
            userName: 'spamUser',
            password: 'spammer',
            userMail: 'spammer@spam.com',
            firstName: 'Mister',
            lastName: 'Spam',
            gender: 'male',
            phoneNumber: 34556543,
            addressStreet: null,
            addressPin: null,
            addressCity: null,
            addressCountry: 'Spamland',
            gameScore: 0,
            activityScore: 0,
            overallScore: 0
        };
        before('init two user into db', function(done) {
            User.create(user1).then(() => {
                return User.create(adminUser);
            }).then(() => {
                done();
            });
        });
        beforeEach('insert to deleted user into db', function(done) {
            User.create(userToDelete).then(() => {
                done();
            }).catch(() => {
                done();
            });
        });
        it('should delete successfully one entry', function(done) {
            chai.request(app).post('/user/login').send({ // login as admin to get valid token
                userLogin: 'admin',
                password: 'adminPW'
            }).end(function(error, response) {
                const token: string = response.body.token;
                chai.request(app).delete('/user/3').set('Authorization', 'Bearer ' + token).end(function(err, res) {
                    expect(err).to.be.eq(null);
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.be.eq('Successfully deleted entry with id=3');
                    User.findOne({
                        where: {
                            userName: 'spamUser'
                        }
                    }).then(user => {
                        expect(user).to.be.eq(null);
                        done();
                    });
                });
            });
        });
        it('should return 202 when no user entry to delete', function(done) {
            chai.request(app).post('/user/login').send({ // login as admin to get valid token
                userLogin: 'admin',
                password: 'adminPW'
            }).end(function(error, response) {
                const token: string = response.body.token;
                chai.request(app).delete('/user/300').set('Authorization', 'Bearer ' + token).end(function(err, res) {
                    expect(err).to.be.eq(null);
                    expect(res).to.have.status(202);
                    expect(res.body.message).to.be.eq('No entry to delete');
                    User.findOne({
                        where: {
                            userName: 'spamUser'
                        }
                    }).then(user => {
                        expect(user).not.to.be.eq(null);
                        done();
                    });
                });
            });
        });
        it('should not delete when not admin', function(done) {
            chai.request(app).post('/user/login').send({
                userLogin: 'gandalf',
                password: 'gandalf4ever'
            }).end(function(error, response) {
                const token: string = response.body.token;
                chai.request(app).delete('/user/3').set('Authorization', 'Bearer ' + token).end(function(err, res) {
                    expect(err).to.be.eq(null);
                    expect(res).to.have.status(403);
                    expect(res.body.message).to.be.eq('This User is not an Admin');
                    User.findOne({
                        where: {
                            userName: 'spamUser'
                        }
                    }).then(user => {
                        expect(user).not.to.be.eq(null);
                        done();
                    });
                });
            });
        });
        after('clear db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true,
            }).then(() => {
                done();
            });
        });
    });
    describe('Test make user admin', () => {
        beforeEach('init user into db', function(done) {
            User.create(user1).then(() => {
                User.create(adminUser).then(() => {
                    done();
                });
            }).catch(err => {
                console.log(err);
            });
        });
        afterEach('clear db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true
            }).then(() => {
                done();
            });
        });
        it('should make user successfully to admin', function(done) {
            User.findOne({
                where: {
                    userName: 'gandalf'
                }
            }).then(user => {
                expect(user.admin).to.be.eq(false);
                chai.request(app).post('/user/login').send({
                    userLogin: 'admin',
                    password: 'adminPW'
                }).end(function(error, response) {
                    const token: string = response.body.token;
                    chai.request(app).put('/user/makeAdmin/1').set('Authorization', 'Bearer ' + token).end(function(err, res) {
                        expect(err).to.be.eq(null);
                        expect(res).to.have.status(200);
                        expect(res.body.admin).to.be.eq(true);
                        expect(res.body.userName).to.be.eq('gandalf');
                        done();
                    });
                });
            });
        });
        it('should not make user to admin when no admin', function(done) {
            User.findOne({
                where: {
                    userName: 'gandalf'
                }
            }).then(user => {
                expect(user.admin).to.be.eq(false);
                chai.request(app).post('/user/login').send({
                    userLogin: 'gandalf',
                    password: 'gandalf4ever'
                }).end(function(error, response) {
                    const token: string = response.body.token;
                    chai.request(app).put('/user/makeAdmin/1').set('Authorization', 'Bearer ' + token).end(function(err, res) {
                        expect(err).to.be.eq(null);
                        expect(res).to.have.status(403);
                        expect(res.body.message).to.be.eq('This User is not an Admin');
                        User.findOne({
                            where: {
                                userName: 'gandalf'
                            }
                        }).then(foundUser => {
                            expect(foundUser.admin).to.be.eq(false);
                            done();
                        });
                    });
                });
            });
        });
        it('should return error, when no user with indicated id', function(done) {
            chai.request(app).post('/user/login').send({
                userLogin: 'admin',
                password: 'adminPW'
            }).end(function(error, response) {
                const token: string = response.body.token;
                chai.request(app).put('/user/makeAdmin/199').set('Authorization', 'Bearer ' + token).end(function(err, res) {
                    expect(err).to.be.eq(null);
                    expect(res).to.have.status(500);
                    done();
                });
            });
        });
    });
    describe('Test get single user', () => {
        before('init user into db', function(done) {
            User.create(user1).then(() => done()).catch(err => console.log(err));
        });
        it('should return requested user', function(done) {
            chai.request(app).get('/user/1').end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(200);
                expect(res.body.userName).to.be.eq('gandalf');
                done();
            });
        });
        it('should return 404 when requested user does not exist', function(done) {
            chai.request(app).get('/user/2').end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(404);
                expect(res.body.message).to.be.eq('User not found!');
                done();
            });
        });
        after('clear db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true,
            }).then(() => {
                done();
            });
        });
    });
    describe('Test update user', () => {
        before('init user into db', function(done) {
            User.create(user1).then(() => done()).catch(err => console.log(err));
        });
        it('should successfully update user', function(done) {
            chai.request(app).post('/user/edit').send({
                userId: 1,
                userName: 'gandalf',
                userMail: 'gandalf@wizards.me',
                firstName: 'Gandalf',
                lastName: 'The White',
                gender: 'male',
                phoneNumber: 796554545,
                addressStreet: null,
                addressPin: null,
                addressCity: null,
                addressCountry: 'Aman'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(200);
                expect(res.body.lastName).to.be.eq('The White');
                User.findByPk(1).then(user => {
                    expect(user.lastName).to.be.eq('The White');
                    done();
                });
            });
        });
        it('should return 500 when to be updated user not exists', function(done) {
            chai.request(app).post('/user/edit').send({
                userId: 2,
                userName: 'admin',
                userMail: 'superAdmin@admins.com',
                firstName: 'Jack',
                lastName: 'Hammington',
                gender: 'male',
                phoneNumber: 796666666,
                addressStreet: null,
                addressPin: null,
                addressCity: 'London',
                addressCountry: 'England'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(500);
                expect(res.body).to.have.property('message');
                done();
            });
        });
        it('should return 500 when cannot update because of bad data', function(done) {
            chai.request(app).post('/user/edit').send({
                userId: 1,
                userName: null,
                userMail: 'gandalf@wizards.me',
                firstName: 'Gandalf',
                lastName: 'The White',
                gender: 'male',
                phoneNumber: 796554545,
                addressStreet: null,
                addressPin: null,
                addressCity: 1,
                addressCountry: 'Aman'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(500);
                done();
            });
        });
        after('clear db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true,
            }).then(() => {
                done();
            });
        });
    });

    describe('Test /passwordForgotten', function() {
        this.timeout(12000);
        before('init db', function(done) {
            User.create(user1).then(user => {
                done();
            });
        });
        after('clear db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true
            }).then(() => {
                done();
            });
        });
        it('should send email successfully', function(done) {
            chai.request(app).post('/user/passwordForgotten').send({
                userEmail: 'gandalf@wizards.me'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res.status).to.be.eq(200);
                expect(res.body.message).to.be.eq('We sent you an email, check out your mail box!');
                done();
            });
        });
        it('should return 404 when user not exists with email', function(done) {
            chai.request(app).post('/user/passwordForgotten').send({
                userEmail: 'notExistent@me.com'
            }).end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res.status).to.be.eq(404);
                expect(res.body.message).to.be.eq('No such user!');
                done();
            });
        });
    });

    describe('Test /restorePassword', function() {
        before('init db', function(done) {
            User.create(user1).then(user => {
                done();
            });
        });
        after('clear db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true
            }).then(() => {
                done();
            });
        });
        it('should restore password successfully with correct token', function(done) {
            const token = jwt.sign({ userName: 'gandalf', userId: 1 }, process.env.JWT_PW_SECRET, { expiresIn: '15m' });
            chai.request(app).post('/user/restorePassword').set('Authorization', 'Bearer ' + token).send({
                password: 'hereAgain'
            }).end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body.message).to.be.eq('Successfully changed the password, you may now sign in!');
                done();
            });
        });
        it('should return 403 when no valid token', function(done) {
            const token = jwt.sign({ userName: 'gandalf', userId: 1 }, process.env.JWT_SECRET, { expiresIn: '15m' });
            chai.request(app).post('/user/restorePassword').set('Authorization', 'Bearer ' + token).send({
                password: 'hereAgain'
            }).end(function(err, res) {
                expect(res).to.have.status(403);
                expect(res.body.message).to.be.eq('Unauthorized');
                done();
            });
        });
    });

    describe('Test updating game score' , function() {
        before('init users into db', function(done) {
            User.create(user1)
            .then(() => done())
            .catch(err => console.log(err));
        });
        it('should update the game score of a user successfully', function(done) {
            chai.request(app).put('/user/updateGameScore/1/7').end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(200);
                expect(res.body.message).to.be.eq('Game score successfully updated!');
                User.findByPk(1).then((user) => {
                    expect(user.gameScore).to.be.eq(7);
                    expect(user.overallScore).to.be.eq(14);
                })
                .then(() => {
                    done();
                });
            });
        });
        after('clear db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true,
            }).then(() => {
                done();
            });
        });
    });

    describe('Test getting game highscores', () => {
        before('init users into db', function(done) {
            User.create(user1)
            .then(() => {
                User.create(adminUser);
            })
            .then(() => done())
            .catch(err => console.log(err));
        });
        it('should return users in the correct order', function(done) {
            chai.request(app).get('/user/highscores/game').end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(200);
                expect(res.body[0].userName).to.be.eq('gandalf');
                expect(res.body[1].userName).to.be.eq('admin');
                done();
            });
        });
        after('clear db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true,
            }).then(() => {
                done();
            });
        });
    });

    describe('Test getting overall high scores', () => {
        before('init users into db', function(done) {
            User.create(user1)
            .then(() => {
                User.create(adminUser);
            })
            .then(() => done())
            .catch(err => console.log(err));
        });
        it('should return users in the correct order', function(done) {
            chai.request(app).get('/user/highscores/overall').end(function(err, res) {
                expect(err).to.be.eq(null);
                expect(res).to.have.status(200);
                expect(res.body[0].userName).to.be.eq('admin');
                expect(res.body[0].userId).to.be.eq(2);
                expect(res.body[0].overallScore).to.be.eq(20);
                expect(res.body[1].userName).to.be.eq('gandalf');
                done();
            });
        });
        after('clear db', function(done) {
            User.destroy({
                truncate: true,
                restartIdentity: true,
            }).then(() => {
                done();
            });
        });
    });
});
