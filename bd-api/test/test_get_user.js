const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;
const { fetchAllPhotos } = require('../utils/utils');

chai.use(chaiHttp);

describe('GET /photos/user/:target', () => {
  it('TA-GET-USER-01: Sėkmingas vartotojo nuotraukų gavimas.', function(done) {
    this.timeout(0);
    fetchAllPhotos()
      .then(allPhotos => {
        const targetUserExists = allPhotos.some(photo => photo.target == 'jjonelis');

        if (!targetUserExists) {
          done();
        } else {
          chai.request(app)
          .get('/photos/user/jjonelis')
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            res.body.forEach(photo => {
              expect(photo).to.have.property('id');
              expect(photo).to.have.property('target');
              expect(photo.target).to.equal('jjonelis');
              expect(photo).to.have.property('objects');
              expect(photo.objects).to.be.an('array');
              photo.objects.forEach(obj => {
                expect(obj).to.have.property('objectName');
                expect(obj).to.have.property('relativeSize');
              });
              expect(photo).to.have.property('photoData');
            });
            done();
          });
        }
      });
  });

    it('TA-GET-USER-02: Neegzistuojančio vartotojo nuotraukų gavimas.', (done) => {
      const nonExistentUser = 'neegzistuojantisVartotojas';

      chai.request(app)
        .get(`/photos/user/${nonExistentUser}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.equal('Nerasta nurodyto vartotojo nuotraukų.');
          done();
        });
    });
  });