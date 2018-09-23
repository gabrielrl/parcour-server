import { Router, Request, Response, NextFunction } from 'express';
import { auth } from '../Auth';

const Guid = require('guid');

import ParcourRepository from '../dal/ParcourRepository';

export class ParcourRouter {
  router: Router
  
  repository: ParcourRepository;

  /**
   * Initialize the ParcourRouter
   */
  constructor(repository: ParcourRepository) {
    this.router = Router();
    this.repository = repository;
    this._init();
  }

  /**
   * GET all Parcours.
   */
  public getAll(req: Request, res: Response, next: NextFunction) {
    this.repository.getAll().then(parcours => res.send(parcours));
  }

  /**
   * GET a Parcour by its ID.
   */
  public getById(req: Request, res: Response, next: NextFunction) {

    let id = req.params.id;    
    this.repository.getById(id)
      .then(parcour => {
        res.status(200).send(parcour);
      })
      .catch(err => {
        res.status(404).send({
          message: 'Not found'
        });
      }); 

  }

  /**
   * Create a (insert a new) parcour.
   * @param req 
   * @param res 
   * @param next 
   */
  public create(req: Request, res: Response, next: NextFunction) {

    let parcour = req.body;

    if (!parcour) {
      return ParcourRouter.sendBadRequest(res,
        new Error('Missing payload.'));
    }
    if (!parcour.name) {
      return ParcourRouter.sendBadRequest(res,
        new Error('Missing "name".'));
    }
    
    // Create an ID if none is specified.
    if (!parcour.id) {
      parcour.id = Guid.raw();
    }

    // Link parcour with current user.
    parcour.userId = req.user.id;

    this.repository.add(parcour)
      .then(result => {
        if (result.rowCount === 0) throw new Error('Insertion failed.');
        return this.repository.getById(parcour.id);
      })
      .then(parcour => {
        res.status(200).send(parcour);
      })
      .catch(err => {
        res.status(500).send({
          message: 'Internal server error',
          error: err.message,
          stack: err.stack
        });
      });

  }

  public update(req: Request, res: Response, next: NextFunction) {
    let id = req.params.id;
    let parcour = req.body;

    if (!parcour) {
      return ParcourRouter.sendBadRequest(res, 
        new Error('Missing payload.'));
    }
    if (!parcour.id) {
      return ParcourRouter.sendBadRequest(res,
        new Error('Missing "id".'));
    } else if (id !== parcour.id) {
      return ParcourRouter.sendBadRequest(res,
        new Error('Payload "id" does not match URL "id".'));
    }
    if (!parcour.name) {
      return ParcourRouter.sendBadRequest(res,
        new Error('Missing "name".'));
    }

    this.repository.update(parcour)
      .then(result => {
        if (result.rowCount === 0) throw new Error('Update failed.');
        return this.repository.getById(id);
      })
      .then(parcour => {
        res.status(200).send(parcour);
      })
      .catch(err => {
        res.status(500).send({
          message: 'Internal server error',
          error: err.message,
          stack: err.stack
        });
      });
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    let id = req.params.id;
    this.repository.removeById(id)
      .then(result => {
        res.status(200).send({ message: 'Parcour deleted' });
      })
      .catch(err => {
        res.status(404).send({ message: 'Not found' });
      });
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  private _init() {
    this.router.get('/', (req, res, next) => this.getAll(req, res, next));
    this.router.get('/:id', (req, res, next) => this.getById(req, res, next));
    this.router.post('/', auth, (req, res, next) => this.create(req, res, next));
    this.router.put('/:id', auth, (req, res, next) => this.update(req, res, next));
    this.router.delete('/:id', auth, (req, res, next) => this.delete(req, res, next));
  }

  private static sendBadRequest(res: Response, error: Error) {
    res.status(400).send({
      message: 'Bad request',
      error: error.message
    });
  }

}

// Create the ParcourRouter, and export its configured Express.Router
const parcourRoutes = new ParcourRouter(new ParcourRepository());

export default parcourRoutes.router;