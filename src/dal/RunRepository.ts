import { QueryResult } from 'pg';
import pool from './Pool';

import Run from '../model/Run';

/**
 * Data access layer for the parcour "Runs".
 */
export default class RunRepository {

  constructor() { }

  public getByParcourId(parcourId: string): Promise<Run[]> {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT id, parcour_id "parcourId", user_id "userId", ' +
        'started_on "startedOn", ended_on "endedOn", outcome ' + 
        'FROM runs r ' +
        'WHERE r.parcour_id = $1 ' +
        'ORDER BY r.updated_on DESC ' +
        'LIMIT 100',
        [ parcourId ]
      ).then(result => {
        resolve(result.rows);
      })
      .catch(err => reject(err));
    });

  }

  public getById(id: string): Promise<Run> {

    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT id, parcour_id "parcourId", user_id "userId", ' +
        'started_on "startedOn", ended_on "endedOn", outcome ' + 
        'FROM runs r ' +
        'WHERE r.id = $1 ',
        [ id ]
      )
        .then(result => {
          if (result.rowCount === 0) reject(new Error('Not found'));
          else resolve(result.rows[0]);
        })
        .catch(err => reject(err));
    });

  }

  public add(run: Run): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      pool.query(
        'INSERT INTO runs(id, parcour_id, user_id, started_on, ended_on, outcome, created_on, updated_on) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $7)',
        [run.id, run.parcourId, run.userId, run.startedOn, run.endedOn, run.outcome, new Date()]
      )
      .then(result => resolve(result))
      .catch(err => reject(err));
    });
  }

  public update(run: Run): Promise<QueryResult> {
    // let data = JSON.stringify(parcour);
    return pool.query(
      'todo'
      // 'UPDATE parcours ' +
      // 'SET name=$2, data=$3, updated_on=$4' +
      // 'WHERE id = $1',
      // [parcour.id, parcour.name, data, new Date()]
    );
  }

  public removeById(id: string) {
    return new Promise((resolve, reject) => {
      pool.query(
        'todo'
        // 'DELETE FROM parcours WHERE id = $1', [id]
      )
      .then(result => {
        if (result.rowCount === 0) reject(new Error('Not found'));
        else resolve(result);
      })
      .catch(err => reject(err));
    });
  }

}
