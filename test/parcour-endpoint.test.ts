import 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../src/App';
import Parcour from '../src/Model/Parcour';

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET api/v1/parcours', () => {

  it('responds with JSON array', () => {
    return chai.request(app).get('/api/v1/parcours')
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
      });
  });

  it('any returned object should have some shared properties', function() {
    return chai.request(app).get('/api/v1/parcours')
      .then(res => {
        let parcours = <Parcour[]> res.body;
        // Should return at least one object.
        expect(parcours).to.have.length.at.least(1);
        // Test only the first returned object.
        let parcour = parcours[0];
        expect(parcour).to.have.all.keys('id', 'name');
      });
  });

});

describe('GET api/v1/parcours/:id', () => {
  // TODO temporary, fragile.  
  const firstParcourId = '92998346-c729-4b9b-9f47-2446ba193b48';

  it('responds with single JSON object', () => {
    return chai.request(app).get('/api/v1/parcours/' + firstParcourId)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
      });
  });

  it('should return the "first" parcour', () => {
    return chai.request(app).get('/api/v1/parcours/' + firstParcourId)
      .then(res => {
        expect(res.body.parcour.name).to.equal('first');
      });
  });
});