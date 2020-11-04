import { UserAttributes, User } from '../models/user.model';
import { LoginResponse, LoginRequest } from '../models/login.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService {

    public register(user: UserAttributes): Promise<UserAttributes> {
        const saltRounds = 12;
        user.password = bcrypt.hashSync(user.password, saltRounds); // hashes the password, never store passwords as plaintext
        const { Op } = require('sequelize');
        return User.findOne({
            where:  {
                [Op.or]: [
                {userName: user.userName},
                {userMail: user.userMail}
                ]
            }
        }).then(function(userFound) {
            if (userFound) {
            return Promise.reject('This username or email address is already being used!');
            }
            return User.create(user).then(inserted => Promise.resolve(inserted)).catch(err => Promise.reject(err));
        })
        .catch(err => Promise.reject({message: err}));
    }

    public login(loginRequestee: LoginRequest): Promise<User | LoginResponse> {
        const secret = process.env.JWT_SECRET;
        const { Op } = require('sequelize');

        return User.findOne({
            where:  {
                [Op.or]: [
                {userName: loginRequestee.userLogin},
                {userMail: loginRequestee.userLogin}
                ]
            }
        })
        .then(user => {
            if (user) {
                if (bcrypt.compareSync(loginRequestee.password, user.password)) {
                    const token: string = jwt.sign({ userName: user.userName, userId: user.userId, admin: user.admin }, secret, { expiresIn: '2h' });
                    return Promise.resolve({ user, token });
                } else {
                return Promise.reject('Wrong password');
                }
            } else {
                return Promise.reject('Could not find this User');
            }
        })
        .catch(err => Promise.reject({message: err}));
    }

    public getAll(): Promise<User[]> {
        return User.findAll();
    }

    public deleteUser(id: number): Promise<number> {
        return User.destroy({
            where: { userId: id }
        });
    }

    public makeUserAdmin(id: number): Promise<User> {
        return User.findOne({
            where: { userId: id }
        }).then(user => {
            return user.update({
                admin: true
            });
        }).catch(err => {
            return Promise.reject({message: err});
        });
    }

    public getSingleUser(id: number): Promise<User> {
        return User.findByPk(id).then(user => {
            if (user) {
                return Promise.resolve(user);
            } else {
                return Promise.reject('User not found!');
            }
        }).catch(err => Promise.reject({message: err}));
    }

    public changeUser(user: UserAttributes): Promise<User> {
        return User.findByPk(user.userId).then(foundUser => foundUser.update(user))
            .catch(err => Promise.reject({message: err}));
    }
}
