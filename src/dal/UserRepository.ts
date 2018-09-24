import { QueryResult } from 'pg';
import pool from './Pool';
import User from '../model/User';

const Guid = require('guid');

export default class UserRepository {

  constructor() { }

  public getAll(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM users'
      ).then(result => {
        resolve(result.rows)
      }).catch(err => reject(err));
    });
  }

  public getOrCreateFromAuthUser(authUser): Promise<User> {

    if (!authUser || !authUser.sub) {
      return Promise.reject(new Error('authUser and authUser.sub must be defined.'));
    }

    return new Promise((resolve, reject) => {

      this.getBySub(authUser.sub)
        .then(parcourUser => {
          if (parcourUser) return parcourUser;
          return this.add({
            id: Guid.raw(),
            nickname: 'Anonymous',
            sub: authUser.sub
          });
        })
        .then(user => resolve(user))
        .catch(err => reject(err));
    

    });
  }

  public getBySub(sub): Promise<User> {
    return new Promise((resolve, reject) => {
      pool
        .query('SELECT * FROM users WHERE sub = $1', [ sub ])
        .then(result => {
          if (result.rowCount === 0) {
            resolve(null);
          } else {
            resolve(result.rows[0]);
          }
        })
        .catch(err => reject(err));
    });
  }

  public add(user: User): Promise<User> {
    return pool.query(
      'INSERT INTO users(id, nickname, sub, created_on, updated_on) VALUES ($1, $2, $3, $4, $4)',
      [ user.id, user.nickname, user.sub, new Date() ]
    ).then(result => {
      return user;
    });
  }
}