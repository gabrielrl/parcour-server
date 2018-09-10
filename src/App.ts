import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as jwt from 'express-jwt';
import * as jwks from 'jwks-rsa';
import ParcourRouter from './routers/ParcourRouter';

var auth = jwt({
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

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();

    this.express.use(cors());
    
    this.middleware();
    this.routes();
        
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  // Configure API endpoints.
  private routes(): void {
    /* This is just to get up and running, and to make sure what we've got is
    * working so far. This function will change when we start to add more
    * API endpoints */
    let router = express.Router();
    // placeholder route handler
    router.get('/', (req, res, next) => {
      res.json({
        message: 'Hello World!'
      });
    });
    this.express.use('/', router);
    this.express.use('/api/v1/parcours', ParcourRouter);

    this.express.use('/api/v1/users/whoami', auth, function(req, res, next) {
      res.json({
        status: 'success',
        message: 'here\'s who',
        data: req.user
      });
    });
  }
}

export default new App().express;