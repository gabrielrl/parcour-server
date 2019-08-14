import { QueryResult } from 'pg';
import pool from './Pool';

import Parcour from '../model/Parcour';
import ParcourError from '../errors/ParcourError';
export default class ParcourRepository {

  constructor() { }

  public getAll(): Promise<Parcour[]> {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT p.id, p.name, p.created_on "createdOn", p.updated_on "updatedOn", ' + 
        'u.id "userId", u.nickname "userNickname"' +
        'FROM parcours p LEFT JOIN users u ON p.user_id = u.id ' +
        'ORDER BY p.updated_on DESC')
      .then(result => {
        resolve(result.rows);
      })
      .catch(err => reject(err));
    });

  }

  public doesExist(parcourId: string): Promise<boolean> {

    return pool.query(
      'SELECT count(*) "c" FROM parcours WHERE id = $1',
      [ parcourId ]      
    ).then(result => {
      return result.rowCount !== 0 && parseInt(result.rows[0].c) !== 0;
    });
  }

  /**
   * Gets a Promise for a parcour object from the database by its id.  
   * @param id
   */

  public getById(id: string): Promise<Parcour> {

    return new Promise((resolve, reject) => {
      pool.query('SELECT data FROM parcours WHERE id = $1', [id])
        .then(result => {
          if (result.rowCount === 0) {
            reject(new ParcourError(
              `Parcour having ID "${ id } could not be found`,
              404
            ));
          } else {
            resolve(result.rows[0].data);
          }
        })
        .catch(err => reject(err));
    });

  }

  public add(parcour: Parcour): Promise<QueryResult> {
    let data = JSON.stringify(parcour);
    return new Promise((resolve, reject) => {
      pool.query(
        'INSERT INTO parcours(id, name, data, created_on, updated_on, user_id) ' +
        'VALUES ($1, $2, $3, $4, $4, $5)',
        [parcour.id, parcour.name, data, new Date(), parcour.userId]
      )
      .then(result => resolve(result))
      .catch(err => reject(err));
    });
  }

  public update(parcour: Parcour): Promise<QueryResult> {
    let data = JSON.stringify(parcour);
    return pool.query(
      'UPDATE parcours ' +
      'SET name=$2, data=$3, updated_on=$4' +
      'WHERE id = $1',
      [parcour.id, parcour.name, data, new Date()]
    );
  }

  public removeById(id: string) {
    return new Promise((resolve, reject) => {
      pool.query(
        'DELETE FROM parcours WHERE id = $1', [id]
      )
      .then(result => {
        if (result.rowCount === 0) reject(new Error('Not found'));
        else resolve(result);
      })
      .catch(err => reject(err));
    });
  }

}
