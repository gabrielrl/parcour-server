import {Pool, Client, QueryResult} from 'pg';

import Parcour from '../model/Parcour';

const data = [
  { id: "1", name: "first", data: "{ first }" },
  { id: "2", name: "second", data: "{ second }" }
];


export default class ParcourRepository {

  private _pool: Pool;

  constructor() {
    this._pool = new Pool({
      user: 'parcour-app',
      host: 'localhost',
      database: 'parcour',
      password: 'parcour',
      port: 5432,
    });

    // EVENTUALLY... this._pool.end()
  }

  public getAll(): Promise<Parcour[]> {
    return new Promise((resolve, reject) => {
      this._pool.query(
        'SELECT id, name, created_on "createdOn", updated_on "updatedOn" FROM parcours ' +
        'ORDER BY updated_on DESC')
      .then(result => {
        resolve(result.rows);
      })
      .catch(err => reject(err));
    });

  }

  public getById(id: string): Promise<Parcour> {

    return new Promise((resolve, reject) => {
      this._pool.query('SELECT data FROM parcours WHERE id = $1', [id])
        .then(result => {
          if (result.rowCount === 0) reject(new Error('Not found'));
          else resolve(result.rows[0].data);
        })
        .catch(err => reject(err));
    });

  }

  public add(parcour: Parcour): Promise<QueryResult> {
    let data = JSON.stringify(parcour);
    return new Promise((resolve, reject) => {
      this._pool.query(
        'INSERT INTO parcours(id, name, data, created_on, updated_on) ' +
        'VALUES ($1, $2, $3, $4, $4)',
        [parcour.id, parcour.name, data, new Date()]
      )
      .then(result => resolve(result))
      .catch(err => reject(err));
    });
  }

  public update(parcour: Parcour): Promise<QueryResult> {
    let data = JSON.stringify(parcour);
    return this._pool.query(
      'UPDATE parcours ' +
      'SET name=$2, data=$3, updated_on=$4' +
      'WHERE id = $1',
      [parcour.id, parcour.name, data, new Date()]
    );
  }

  public removeById(id: string) {
    return new Promise((resolve, reject) => {
      this._pool.query(
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