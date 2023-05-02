const Middleware = require(base("illuminate/middlewares/Middleware"));

class WrapResponse extends Middleware {
  handle(req, res, next){
    const originalJson = res.json;
    res.json = function (response) {
      const { data, message } = response;
      const success = res.statusCode >= 200 && res.statusCode < 300;
      const wrappedData = (typeof data === 'undefined' && typeof message === 'undefined')
        ?{ success, data:response }
        :{ success, data, message };
      originalJson.call(res, wrappedData);
    };
    next();
  };
};

module.exports = WrapResponse;
