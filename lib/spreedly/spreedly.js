var Spreedly, easyxml, extend, fs, https, querystring, request, xml2json;

request = require("request");

xml2json = require("xml2json");

easyxml = require("easyxml");

https = require("https");

fs = require("fs");

querystring = require('querystring');

extend = require("xtend");

module.exports = Spreedly = (function() {
  function Spreedly(env_key, api_key) {
    var options;
    this.env_key = env_key;
    this.api_key = api_key;
    this.url = "https://core.spreedly.com/";
    this.version = "v1";
    options = {
      singularizeChildren: true,
      underscoreAttributes: true,
      rootElement: null,
      dateFormat: 'ISO',
      indent: 4,
      manifest: false
    };
    easyxml.configure(options);
  }

  Spreedly.prototype.json_to_xml = function(json) {
    var xml;
    xml = easyxml.render(json);
    return xml;
  };

  Spreedly.prototype.get = function(path, headers, data, callback) {
    return this.request("GET", path, headers, data, callback);
  };

  Spreedly.prototype.post = function(path, headers, data, callback) {
    return this.request("POST", path, headers, data, callback);
  };

  Spreedly.prototype.request = function(method, path, headers, data, callback) {
    var body, error, get_req, options, xml;
    console.log("rendering data:", data);
    xml = this.json_to_xml(data);
    console.log("Sending:", xml);
    options = {
      host: 'core.spreedly.com',
      path: "/" + this.version + "/" + path,
      method: method,
      headers: {
        "Content-Type": "application/xml",
        'Content-Length': Buffer.byteLength(xml, 'utf8')
      }
    };
    options.headers = extend(options.headers, headers);
    body = "";
    error = null;
    console.log("request options:", options);
    get_req = https.request(options, function(res) {
      res.on('data', function(chunk) {
        return body += chunk;
      });
      return res.on('end', function() {
        var json, result;
        console.log("Got Result:", body);
        json = xml2json.toJson(body);
        result = JSON.parse(json);
        console.log("Converted Result:", result);
        return callback(error, result);
      });
    });
    get_req.on('error', function(err) {
      return error = err;
    });
    get_req.write(xml);
    return get_req.end();
  };

  Spreedly.prototype.get_payment_token = function(callback) {
    var data, headers, path;
    path = "gateways.xml";
    data = {
      gateway: {
        gateway_type: "test"
      }
    };
    headers = {
      'Authorization': 'Basic ' + new Buffer(this.env_key + ':' + this.api_key).toString('base64')
    };
    return this.get(path, headers, data, function(err, result) {
      var ref;
      if (err) {
        return callback(err, result);
      }
      return callback(err, result != null ? (ref = result.gateways) != null ? ref.gateway[0].token : void 0 : void 0);
    });
  };

  Spreedly.prototype.submit_payment_info = function(callback) {
    var data, headers, path;
    path = "payment_methods.xml";
    data = {
      payment_method: {
        credit_card: {
          first_name: "Joe",
          last_name: "Jones",
          number: "5555555555554444",
          month: "3",
          year: "2032"
        },
        email: "joey@example.com",
        data: {
          my_payment_method_identifier: "448",
          extra_stuff: {
            some_other_things: "Can be anything really"
          }
        }
      }
    };
    headers = {
      'Authorization': 'Basic ' + new Buffer(this.env_key + ':' + this.api_key).toString('base64')
    };
    return this.post(path, headers, data, callback);
  };

  return Spreedly;

})();
