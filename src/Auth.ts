import { Request, Response, NextFunction } from 'express';
import * as jwt from 'express-jwt';
import * as jwks from 'jwks-rsa';
import UserRepository from './dal/UserRepository';

const checkJwt = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: "https://parcour.auth0.com/.well-known/jwks.json"
  }),
  audience: 'http://localhost:8080',
  issuer: "https://parcour.auth0.com/",
  algorithms: ['RS256']
});

const auth = function(req: Request, res: Response, next: NextFunction) {

  checkJwt(req, res, function (err?) {
    if (err) return next(err);

    userRepository
      .getOrCreateFromAuthUser(req.user)
      .then(parcourUser => {
        req['authUser'] = req.user;
        req.user = parcourUser;
        next();
      })
      .catch(err => next(err));
  })

};

const userRepository = new UserRepository();

const getParcourUser = function(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    userRepository
      .getOrCreateFromAuthUser(req.user)
      .then(parcourUser => {
        req['parcourUser'] = parcourUser;
        next();
      })
      .catch(err => next(err));
  }
};

export { checkJwt, auth, getParcourUser };