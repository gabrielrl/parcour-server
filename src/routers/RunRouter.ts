import {Router, Request, Response, NextFunction} from 'express';

const Guid = require('guid');

import { auth, AuthenticatedRequest } from '../Auth';
import RunRepository from '../dal/RunRepository';
import { RunOutcome } from '../model/RunOutcome';

/**
 * Expected to be mounted below a route which already captures a `parcourId` param.
 */
export class RunRouter {
  router: Router
  
  repository: RunRepository;

  constructor(repository: RunRepository) {
    this.router = Router({ mergeParams: true });
    this.repository = repository;
    this._init();
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  private _init() {
    this.router.get('/', (req, res, next) => this.getByParcourId(req, res, next));
    // this.router.get('/:id', (req, res, next) => this.getById(req, res, next));
    this.router.post('/', auth, (req, res, next) => this.create(<AuthenticatedRequest>req, res, next));
    // this.router.put('/:id', (req, res, next) => this.update(req, res, next));
    // this.router.delete('/:id', (req, res, next) => this.delete(req, res, next));

  }

  public getByParcourId(req: Request, res: Response, next: NextFunction) {
    this.repository.getByParcourId(req.params.parcourId)
      .then(runs => res.send(runs))
      .catch(err => next(err));
  }

  create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let pid = req.params.parcourId;
    let uid = req.user.id;

    let run = {
      id: Guid.raw(),
      parcourId: pid,
      userId: uid,
      startedOn: null,
      endedOn: null,
      outcome: RunOutcome.Pending
    };

    this.repository.add(run)
      .then(result => {
        if (result.rowCount === 0) throw new Error('Insertion failed.');
        return this.repository.getById(run.id);
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

}

const userRouter = new RunRouter(new RunRepository());

export default userRouter.router;
