const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;
const { fetchAllPhotos } = require('../utils/utils');

chai.use(chaiHttp);

describe('GET /photos/similar/:id', () => {
  let users;

  before(async function() {
    const allPhotos = await fetchAllPhotos();
    users = [...new Set(allPhotos.map(photo => photo.target))];
  });

  it('TA-GET-SIMILAR-01: Sėkmingas panašumo nustatymo duomenų gavimas.', function(done) {
    this.timeout(0);

    if (users.length === 0) {
      done();
    } else {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      chai.request(app)
        .get(`/photos/similar/${randomUser}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          res.body.forEach(user => {
            expect(user).to.have.property('target');
            expect(user.target).to.be.a('number');
            expect(user).to.have.property('objectsByFrequency');
            expect(user.objectsByFrequency).to.be.an('object');
            expect(user).to.have.property('similarityByFrequency');
            expect(user.similarityByFrequency).to.be.a('number');
            expect(user).to.have.property('objectsByRelativeSize');
            expect(user.objectsByRelativeSize).to.be.an('object');
            expect(user).to.have.property('similarityByRelativeSize');
            expect(user.similarityByRelativeSize).to.be.a('number');
          });
          done();
        });
    }
  });

  it('TA-GET-SIMILAR-02: Neegzistuojančio vartotojo panašumo nustatymo duomenų gavimas.', (done) => {
    const nonExistentUser = 'neegzistuojantisVartotojas';
    
    chai.request(app)
      .get(`/photos/similar/${nonExistentUser}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal('Nurodytas vartotojas neegzistuoja.');
        done();
      });
  });
});