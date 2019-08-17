'use strict';

import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { mockReq, mockRes } from 'sinon-express-mock';

chai.use(sinonChai);
const expect = chai.expect;

import { QueryResult } from 'pg';

import RunRoutes from '../src/routers/RunRoutes';
import ParcourError from '../src/errors/ParcourError';
import { RunOutcome } from '../src/model/RunOutcome';

describe.only('RunRoutes', () => {

  var runRepository; //: RunRepository;
  var parcourRepository; //: ParcourRepository;
  var routes; //: RunRoutes;

  var req, res, next;

  const userId = 'user-id';
  const parcourId = 'parcour-id';
  const runId = 'run-id';
  const runsByParcourId = [{}, {}, {}];

  var addedRun = null;
  var updatedRun = null;

  describe('getByParcourId', () => {

    describe('called without a parcour ID', () => {

      before(() => {
        stubDepdencies();
        req = mockReq();
        routes.getByParcourId(req, res, next);
      });

      itDoesNotCheckForParcourExistence();
      itDoesNotFetchRuns();
      itInvokesNextWithErrorStatus(400);

    });

    describe('called with a non-existent parcour ID', () => {
      before(() => {
        stubDepdencies();
        parcourRepository.doesExist.callsFake(parcourId => Promise.resolve(false));
        req = mockReq({
          params: { parcourId }
        });
        routes.getByParcourId(req, res, next);
      });

      itChecksForParcourExistence();
      itDoesNotFetchRuns();
      itInvokesNextWithErrorStatus(404);

    });

    describe('called with a parcour ID', () => {

      before(() => {

        stubDepdencies();
        req = mockReq({
          params: { parcourId }
        });

        routes.getByParcourId(req, res, next);
      });

      itChecksForParcourExistence();

      it('fetches runs', () => {
        expect(runRepository.getByParcourId).to.have.been.calledOnceWith(parcourId);
      });

      it('responds with obtained runs in JSON', () => {
        expect(res.json).to.have.been.calledOnceWith(runsByParcourId);
      });

      itDoesNotInvokeNext();

    });

    function stubDepdencies() {

      runRepository = {
        getByParcourId: sinon.stub().callsFake(parcourId => Promise.resolve(runsByParcourId))
      };
  
      parcourRepository = {
        doesExist: sinon.stub().callsFake(parcourId => Promise.resolve(true)),
        getById: sinon.stub().callsFake(parcourId => Promise.resolve({}))
      }
  
      routes = new RunRoutes(runRepository, parcourRepository);
  
      res = mockRes();
      next = sinon.spy();
  
    }

  });

  describe('create', () => {

    describe('called without a parcour ID', () => {
      before(() => {
        stubDepdencies();
        req = mockReq({
          params: {},
          user: { id: userId }
        });
        routes.create(req, res, next);
      });

      itDoesNotCheckForParcourExistence();
      itDoesNotInvokeAdd();
      itInvokesNextWithErrorStatus(400);

    });
    
    describe('called with a non-existent parcour ID', () => {
      before(() => {
        stubDepdencies();
        parcourRepository.doesExist.callsFake(parcourId => Promise.resolve(false));
        req = mockReq({
          params: { parcourId },
          user: { id: userId }
        });
        routes.create(req, res, next);
      });

      itChecksForParcourExistence();
      itDoesNotInvokeAdd();
      itInvokesNextWithErrorStatus(404);

    });

    describe('usually (unauthenticated)', () => {
      before(() => {
        stubDepdencies();
        req = mockReq({
          params: { parcourId },
          user: null
        });
        routes.create(req, res, next);
      });

      itChecksForParcourExistence();

      it('invokes `runRepository.add` with specified parcour ID', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.parcourId === parcourId)
        );
      });

      it('invokes `runRepository.add` without user ID', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.userId == null)
        );
      });

      it('invokes `runRepository.add` without start time', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.startedOn === null)
        );
      });

      it('invokes `runRepository.add` without end time', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.endedOn === null)
        );
      });

      it('invokes `runRepository.add` with pending outcome', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.outcome === RunOutcome.Pending)
        );
      });

      itRespondsWithStatus(201);
      
      it('responds with Location header set to the created run URL', () => {
        expect(res.set).to.have.been.calledWith(
          'Location',
          '/parcours/parcour-id/runs/run-id'
        );
      });

      itDoesNotInvokeNext();      

    });

    describe('usually (authenticated)', () => {
      before(() => {
        stubDepdencies();
        req = mockReq({
          params: { parcourId },
          user: { id: userId }
        });
        routes.create(req, res, next);
      });
  
      itChecksForParcourExistence();
      
      it('invokes `runRepository.add` with specified parcour ID', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.parcourId === parcourId)
        );
      });

      it('invokes `runRepository.add` with authenticated user ID', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.userId === userId)
        );
      });

      it('invokes `runRepository.add` without start time', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.startedOn === null)
        );
      });

      it('invokes `runRepository.add` without end time', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.endedOn === null)
        );
      });

      it('invokes `runRepository.add` with pending outcome', () => {
        expect(runRepository.add).to.have.been.calledOnceWith(
          sinon.match(r => r.outcome === RunOutcome.Pending)
        );
      });

      itRespondsWithStatus(201);
      
      it('responds with Location header set to the created run URL', () => {
        expect(res.set).to.have.been.calledWith(
          'Location',
          '/parcours/parcour-id/runs/run-id'
        );
      });

      itDoesNotInvokeNext();      
      
    });

    function stubDepdencies() {

      addedRun = null;

      let addResult = {
        rowCount: 1
      };

      runRepository = {
        add: sinon.stub().callsFake(run => {
          addedRun = run;
          return Promise.resolve(addResult)
        }),
        getById: sinon.stub().callsFake(rundId => Promise.resolve({
          id: runId,
          parcourId
        })),
        getByParcourId: sinon.stub().callsFake(parcourId => Promise.resolve(runsByParcourId))
      };
  
      parcourRepository = {

        doesExist: sinon.stub().callsFake(parcourId => Promise.resolve(true)),
        getById: sinon.stub().callsFake(parcourId => Promise.resolve({}))
      }
  
      routes = new RunRoutes(runRepository, parcourRepository);
  
      res = mockRes();
      next = sinon.spy();
  
    }

  });

  describe('update', () => {

    describe('called without a body', () => {
      before(() => {
        stubDependencies();
        req = mockReq({
          params: { parcourId },
          user: { id: userId },
          body: undefined
        });
        routes.update(req, res, next);
      });

      itDoesNotInvokeUpdate();
      itInvokesNextWithErrorStatus(400);      
    });

    describe('called with non-matching parcour IDs', () => {
      before(() => {
        stubDependencies();
        req = mockReq({
          params: { parcourId },
          user: { id: userId },
          body: {
            id: 'run-id',
            parcourId: '-another-parcour-id-',
            userId,
            startedOn: new Date(2010, 5, 6, 12, 0, 0, 0),
            endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
            outcome: RunOutcome.Completed
          }
        });
        routes.update(req, res, next);
      });

      itDoesNotInvokeUpdate();
      itInvokesNextWithErrorStatus(400);
    });

    describe('called with non-matching user IDs (unauthenticated)', () => {
      before(() => {
        stubDependencies();
        req = mockReq({
          params: { parcourId },
          user: null,
          body: {
            id: 'run-id',
            parcourId,
            userId,
            startedOn: new Date(2010, 5, 6, 12, 0, 0, 0),
            endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
            outcome: RunOutcome.Completed
          }
        });
        routes.update(req, res, next);
      });

      itDoesNotInvokeUpdate();
      itInvokesNextWithErrorStatus(400);
    });

    describe('called with non-matching user IDs (authenticated)', () => {
      before(() => {
        stubDependencies();
        req = mockReq({
          params: { parcourId },
          user: { id: userId },
          body: {
            id: 'run-id',
            parcourId,
            userId: '-another-user-id-',
            startedOn: new Date(2010, 5, 6, 12, 0, 0, 0),
            endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
            outcome: RunOutcome.Completed
          }
        });
        routes.update(req, res, next);
      });

      itDoesNotInvokeUpdate();
      itInvokesNextWithErrorStatus(400);
    });

    describe('called without a start timestamp', () => {
      before(() => {
        stubDependencies();
        req = mockReq({
          params: { parcourId },
          user: { id: userId },
          body: {
            id: 'run-id',
            parcourId,
            userId,
            // startedOn: new Date(2010, 5, 6, 12, 0, 0, 0),
            endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
            outcome: RunOutcome.Completed
          }
        });
        routes.update(req, res, next);
      });
      
      itDoesNotInvokeUpdate();
      itInvokesNextWithErrorStatus(400);
    });

    describe('called without an end timestamp', () => {
      before(() => {
        stubDependencies();
        req = mockReq({
          params: { parcourId },
          user: { id: userId },
          body: {
            id: 'run-id',
            parcourId,
            userId,
            startedOn: new Date(2010, 5, 6, 12, 0, 0, 0),
            // endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
            outcome: RunOutcome.Completed
          }
        });
        routes.update(req, res, next);
      });
      
      itDoesNotInvokeUpdate();
      itInvokesNextWithErrorStatus(400);
    });
    describe('called without an outcome', () => {
      describe('null', () => {
        before(() => {
          stubDependencies();
          req = mockReq({
            params: { parcourId },
            user: { id: userId },
            body: {
              id: 'run-id',
              parcourId,
              userId,
              startedOn: new Date(2010, 5, 6, 12, 0, 0, 0),
              endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
              outcome: null // RunOutcome.Completed
            }
          });
          routes.update(req, res, next);
        });
        
        itDoesNotInvokeUpdate();
        itInvokesNextWithErrorStatus(400);
      });

      describe('RunOutcome.Completed', () => {
        before(() => {
          stubDependencies();
          req = mockReq({
            params: { parcourId },
            user: { id: userId },
            body: {
              id: 'run-id',
              parcourId,
              userId,
              startedOn: new Date(2010, 5, 6, 12, 0, 0, 0),
              endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
              outcome: RunOutcome.Pending
            }
          });
          routes.update(req, res, next);
        });
        
        itDoesNotInvokeUpdate();
        itInvokesNextWithErrorStatus(400);
      });
    });

    describe('called with a run that ends before it begins', () => {
      before(() => {
        stubDependencies();
        req = mockReq({
          params: { parcourId },
          user: { id: userId },
          body: {
            id: 'run-id',
            parcourId,
            userId,
            startedOn: new Date(2010, 5, 6, 12, 37, 0, 0),
            endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
            outcome: RunOutcome.Completed
          }
        });
        routes.update(req, res, next);
      });
      
      itDoesNotInvokeUpdate();
      itInvokesNextWithErrorStatus(400);
    });

    describe('usually (unauthenticated)', () => {
      before(() => {
        stubDependencies();
        req = mockReq({
          params: { parcourId },
          user: null,
          body: {
            id: 'run-id',
            parcourId,
            userId: null,
            startedOn: new Date(2010, 5, 6, 12, 0, 0, 0),
            endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
            outcome: RunOutcome.Completed
          }
        });
        routes.update(req, res, next);
      });

      itInvokesUpdateWithOriginalPayload();
    });


    describe('usually (authenticated)', () => {
      before(() => {
        stubDependencies();
        req = mockReq({
          params: { parcourId },
          user: { id: userId },
          body: {
            id: 'run-id',
            parcourId,
            userId,
            startedOn: new Date(2010, 5, 6, 12, 0, 0, 0),
            endedOn: new Date(2010, 5, 6, 12, 12, 12, 0),
            outcome: RunOutcome.Completed
          }
        });
        routes.update(req, res, next);
      });

      itInvokesUpdateWithOriginalPayload();
    });

    function itInvokesUpdateWithOriginalPayload() {
      it('invokes `runRepository.update` with the original payload', () => {
        expect(runRepository.update).to.have.been.calledOnceWith(req.body);
      });
    }

    function stubDependencies() {

      updatedRun = null;

      let updateResult = {
        rowCount: 1
      };

      runRepository = {
        update: sinon.stub().callsFake(run => {
          addedRun = run;
          return Promise.resolve(updateResult)
        }),
        getById: sinon.stub().callsFake(rundId => Promise.resolve({
          id: runId,
          parcourId
        })),
        getByParcourId: sinon.stub().callsFake(parcourId => Promise.resolve(runsByParcourId))
      };
  
      parcourRepository = {

        doesExist: sinon.stub().callsFake(parcourId => Promise.resolve(true)),
        getById: sinon.stub().callsFake(parcourId => Promise.resolve({}))
      }
  
      routes = new RunRoutes(runRepository, parcourRepository);
  
      res = mockRes();
      next = sinon.spy();
  
    }

  });

  function itDoesNotCheckForParcourExistence() {
    it('does not check for parcour existence', () => {
      expect(parcourRepository.doesExist).not.to.have.been.called;
    });
  }

  function itChecksForParcourExistence() {
    it('checks for parcour existence', () => {
      expect(parcourRepository.doesExist).to.have.been.calledOnceWith(parcourId);
    });
  }

  function itDoesNotFetchRuns() {
    it('does not fetch runs', () => {
      expect(runRepository.getByParcourId).not.to.have.been.called;
    });
  }

  function itDoesNotInvokeAdd() {
    it('does not invoke `runRepository.add`', () => {
      expect(runRepository.add).not.to.have.been.called;
    });
  }

  function itDoesNotInvokeUpdate() {
    it('does not invoke `runRepository.update`', () => {
      expect(runRepository.update).not.to.have.been.called;
    });
  }

  function itRespondsWithStatus(status: number) {
    it(`responds with status ${ status }`, () => {
      expect(res.status).to.have.been.calledOnceWith(status);
    });
  }

  function itInvokesNextWithErrorStatus(status: number) {
    it(`invokes next middleware with error status ${ status }`, () => {
      expect(next).to.have.been.calledOnceWith(
        sinon.match(err => err instanceof ParcourError && err.status === status));
    });
  }

  function itDoesNotInvokeNext() {
    it('does not invoke the next middleware', () => {
      expect(next).not.to.have.been.called;
    });
  }

});
