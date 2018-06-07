import should from 'should';
import mongoose  from 'mongoose';
import Account from '../models/account.js';

describe('Account', () => {

  before((done) => {
    const db = mongoose.connect('mongodb://localhost/test');
    done();
  });

  after((done) => {
    mongoose.connection.close();
    done();
  });

  beforeEach( (done) => {
    var account = new Account({
      username: 'demo',
      password: 'demo'
    });
    account.save((error) => {
      if (error) console.log(`error ${error.message}`);
      else console.log('no error');
      done();
    });
  });
  it('find a user by username', (done) => {
    Account.findOne({ username: 'demo' }, (err, account) => {
      account.username.should.eql('demo');
      console.log('username: ', account.username);
      done();
    });
  });

  afterEach((done) => {
    Account.remove({}, () => {
      done();
    });
  });

});
