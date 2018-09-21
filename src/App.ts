import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import ParcourRouter from './routers/ParcourRouter';
import UserRouter from './routers/UserRouter';

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
    
    this.express.use(function finalErrorHandler(err, req, res, next) {
      if (err) {
        res.status(err.status || 500).json({
          status: 'error',
          message: err.message,
          stack: err.stack // !!
        });
      }

    });
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
    this.express.use('/api/v1/users', UserRouter);
  }
}

export default new App().express;