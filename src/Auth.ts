import { Request, Response, NextFunction } from 'express';
import * as jwt from 'express-jwt';
import * as jwks from 'jwks-rsa';
import UserRepository from './dal/UserRepository';

const userRepository = new UserRepository();

const checkJwt = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://parcour.auth0.com/.well-known/jwks.json'
  }),
  audience: 'http://localhost:8080',
  issuer: 'https://parcour.auth0.com/',
  algorithms: [ 'RS256' ]
});

/**
 * Checks for and validates a JSON Web Token to authenticate the request. If no auth info is found, the request is
 * responded with Unauthorized, else the request object is augmented with a `User` instance on the `user`
 * property before being handled to the next function.
 * @param req Request
 * @param res Response
 * @param next Next function
 */
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

export { auth };
