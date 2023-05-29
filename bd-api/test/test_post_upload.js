const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);
const app = require('../app');

describe('POST /photos/upload', function () {

  it('TA-POST-UPLOAD-01: Sėkmingas įkėlimas ir apdorojimas.', function(done) {
    this.timeout(0); 
    const requestBody = {
        username: 'bakalaurinis',
        password: 'Bakalauras2023$',
        target: 'dominykasbucas',
        check: 'false'
    };

    chai.request(app)
        .post('/photos/upload')
        .send(requestBody)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            expect(res.body.message).to.equal('Nuotraukos įkeltos sėkmingai.');
            done();
        });
});

  it('TA-POST-UPLOAD-02: Trūkstamo lauko klaida.', function(done) {
    this.timeout(0); 
    const requestBody = {
        username: 'bakalaurinis', 
        password: '', 
        target: 'dominykasbucas',
        check: 'false'
    };

    chai.request(app)
        .post('/photos/upload')
        .send(requestBody)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal('Slapyvardis, slaptažodis ir norimo palyginti vartotojo vardas yra privalomi.');
            done();
        });
  });
});