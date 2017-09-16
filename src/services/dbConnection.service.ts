console.log('...Pre-loading [DB services]');

var MongoClient = require('mongodb').MongoClient;

function DB() {
  this.systemDb = null;         // MongoDB system database connection
  this.masterDb = null;         // MongoDB master database connection
  this.transactionDb = null;    // MongoDB transaction database connection
}

DB.prototype.connectSystemDb = () => {
  console.log('.../.../Connecting System DB');

  return new Promise((resolve, reject) => {
    if (this.systemDb) {
        console.log('Return existing Db');
        resolve(this.systemDb);
    } else {
        MongoClient.connect('mongodb://localhost:27017/gksbs')
          .then((db) => {
            console.log('.../.../Connected to System DB');
            console.log('Return new Db');
            this.systemDb = db;
            resolve(db);
          })
          .catch((err) => {
            console.log('Error connecting system db: ' + err.message);
            reject(err.message);
          });
    }
  });

}

DB.prototype.closeSystemDb = () => {
  if (this.systemDb) {
    this.systemDb.close()
      .then(() => console.log('System Db is closed!'))
      .catch((err) => console.log('Failed to close system db. Error: ' + err.message));
  }
}

DB.prototype.connectMasterDb = (uri) => {
  console.log('.../.../Connecting Master DB');

  return new Promise((resolve, reject) => {
    if (this.masterDb) {
        console.log('Return existing Db');
        resolve(this.masterDb);
    } else {
        MongoClient.connect(uri)
          .then((db) => {
            console.log('.../.../Connected to Master DB');
            console.log('Return new Db');
            this.masterDb = db;
            resolve(db);
          })
          .catch((err) => {
            console.log('Error connecting master db: ' + err.message);
            reject(err.message);
          });
    }
  });

}

module.exports = DB;
