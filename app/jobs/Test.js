const Job = require(base('illuminate/jobs/Job'));

class Test extends Job {
  async dispatch(data){
    console.log(data)
  }
}

module.exports = Test;