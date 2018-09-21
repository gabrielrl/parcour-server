import {Router, Request, Response, NextFunction} from 'express';

const Guid = require('guid');

import * as Auth from '../Auth';
import UserRepository from '../dal/UserRepository';


export class UserRouter {
  router: Router
  
  repository: UserRepository;

  constructor(repository: UserRepository) {
    this.router = Router();
    this.repository = repository;
    this._init();
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  private _init() {
    this.router.get('/', (req, res, next) => this.getAll(req, res, next));
    // this.router.get('/:id', (req, res, next) => this.getById(req, res, next));
    // this.router.post('/', (req, res, next) => this.create(req, res, next));
    // this.router.put('/:id', (req, res, next) => this.update(req, res, next));
    // this.router.delete('/:id', (req, res, next) => this.delete(req, res, next));

    this.router.get('/whoami', Auth.auth, /*Auth.checkJwt, Auth.getParcourUser,*/ (req, res, next) => this.whoAmI(req, res, next));
  }

  public getAll(req: Request, res: Response, next: NextFunction) {
    this.repository.getAll()
      .then(users => res.send(users))
      .catch(err => next(err));
  }

  public whoAmI(req: Request, res: Response, next: NextFunction) {
    res.json({
      status: 'success',
      message: 'here\'s who',
      user: req.user,
      authInfo: req['authUser']
    });
  }

}

const userRouter = new UserRouter(new UserRepository());

export default userRouter.router;