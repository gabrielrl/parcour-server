import { Router, Request, Response, NextFunction, IRouter } from 'express';

const Guid = require('guid');

import { auth, checkAuth, AuthenticatedRequest } from '../Auth';
import RunRepository from '../dal/RunRepository';
import Run from '../model/Run';
import { RunOutcome } from '../model/RunOutcome';
import ParcourRepository from '../dal/ParcourRepository';
import ParcourError from '../errors/ParcourError';
import NotFoundError from '../errors/NotFoundError';
import BadRequestError from '../errors/BadRequestError';

/**
 * Expected to be mounted below a route which already captures a `parcourId` param.
 */
export default class RunRoutes {
  private _router: Router;
  
  private _runRepository: RunRepository;

  private _parcourRepository: ParcourRepository;

  constructor(runRepository?: RunRepository, parcourRepository?: ParcourRepository) {
    this._router = Router({ mergeParams: true });
    this._runRepository = runRepository || new RunRepository();
    this._parcourRepository = parcourRepository || new ParcourRepository();

    // Setup
    this._router.get('/', (req, res, next) => this.getByParcourId(req, res, next));
    // this.router.get('/:id', (req, res, next) => this.getById(req, res, next));
    this._router.post('/', checkAuth, (req, res, next) => this.create(<AuthenticatedRequest>req, res, next));
    this._router.put('/:id', auth, (req, res, next) => this.update(<AuthenticatedRequest>req, res, next));
    // this.router.delete('/:id', (req, res, next) => this.delete(req, res, next));
  }

  get router(): Router { return this._router; }

  getByParcourId(req: Request, res: Response, next: NextFunction) {

    if (!req.params.parcourId) {
      return next(new ParcourError('Missing parcour ID path parameter.', 400));
    }

    let pid = req.params.parcourId;

    this._parcourRepository.doesExist(pid)
      .then(exist => {
        if (!exist) {
          throw new NotFoundError('parcour', pid);
        } else {
          return this._runRepository.getByParcourId(pid);
        }
      })
      .then(runs => res.json(runs))
      .catch(next);
  }

  create(req: AuthenticatedRequest, res: Response, next: NextFunction) {

    if (req.params.parcourId == null) {
      return next(new ParcourError('Missing parcour ID path parameter.', 400));
    }

    let pid = req.params.parcourId;
    let uid = req.user && req.user.id || null;

    let run = {
      id: Guid.raw(),
      parcourId: pid,
      userId: uid,
      startedOn: null,
      endedOn: null,
      outcome: RunOutcome.Pending
    };

    this._parcourRepository.doesExist(pid)
      .then(exist => {
        if (!exist) {
          throw new NotFoundError('parcour', pid);
        } else {
          return this._runRepository.add(run);
        }
      })
      .then(result => {
        if (result.rowCount === 0) throw new Error('Insertion failed.');
        return this._runRepository.getById(run.id);
      })
      .then(run => {
        res.status(201)
        .set('Location', `/parcours/${ run.parcourId }/runs/${ run.id }`)
        .json({
          status: 'success',
          message: 'run created',
          run
        });
      })
      .catch(next);

  }

  update(req: AuthenticatedRequest, res: Response, next: NextFunction) {

    let pid = req.params.parcourId;
    let uid = req.user && req.user.id || null;

    let run = <Run>req.body;
    if (run == null) {
      return next(new BadRequestError('Missing or invalid request body'));
    }

    if (pid !== run.parcourId) {
      return next(new BadRequestError('`parcourId` in the path must match the value in the payload'));
    }

    if (uid !== run.userId) {
      return next(new BadRequestError('Authenticated user must match the run user'));
    }

    this._runRepository
      .update(run)
      .then(result => {
        if (result.rowCount === 0) throw new Error('0 row affected');

        return this._runRepository.getById(run.id);
      })
      .then(run => {
        res.json({
          status: 'success',
          message: 'run updated',
          run
        });
      })
      .catch(next);
    
  }

}
