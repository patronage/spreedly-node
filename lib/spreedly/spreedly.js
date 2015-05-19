var fs = require('fs');
var qs = require('qs');
var https = require('https');
var extend = require('xtend');
var easyxml = require('easyxml');
var request = require('request');
var xml2json = require('xml2json');


var Spreedly = (function() {
    function Spreedly( env_key, api_key ) {
        var options;
        this.version = 'v1';
        this.env_key = env_key;
        this.api_key = api_key;
        this.url = 'https://core.spreedly.com/';

        easyxml.configure({
            indent: 4,
            manifest: false,
            dateFormat: 'ISO',
            rootElement: null,
            singularizeChildren: true,
            underscoreAttributes: true
        });
    }

    Spreedly.prototype.json_to_xml = function( json ) {
        return easyxml.render( json );
    };

    Spreedly.prototype.get = function( path, headers, data, callback ) {
        return this.request( 'GET', path, headers, data, callback );
    };

    Spreedly.prototype.post = function( path, headers, data, callback ) {
        return this.request( 'POST', path, headers, data, callback );
    };

    Spreedly.prototype.request = function( method, path, headers, data, callback ) {
        var body = '';
        var error = null;
        var xml = this.json_to_xml( data );

        var options = {
            host: 'core.spreedly.com',
            path: '/' + this.version + '/' + path,
            method: method,
            headers: {
                'Content-Type': 'application/xml',
                'Content-Length': Buffer.byteLength(xml, 'utf8')
            }
        };

        options.headers = extend( options.headers, headers );

        var get_req = https.request(options, function( res ) {
            res.on('data', function( chunk ) {
                return body += chunk;
            });

            return res.on('end', function() {
                var json = xml2json.toJson(body);
                var result = JSON.parse( json );

                console.log('Converted Result:', result);
                console.log('Got Result:', body);

                return callback( error, result );
            });
        });

        get_req.on('error', function( err ) {
            return error = err;
        });

        get_req.write( xml );

        return get_req.end();

        console.log('rendering data:', data);
        console.log('Sending:', xml);
        console.log('request options:', options);
    };

    // Adds a gateway
    Spreedly.prototype.get_payment_token = function( callback ) {
        var path = 'gateways.xml';

        var data = {
            gateway: {
                gateway_type: 'test'
            }
        };

        var headers = { 'Authorization': 'Basic ' + new Buffer(this.env_key + ':' + this.api_key).toString('base64') };

        return this.get(path, headers, data, function( error, result ) {
            if ( error ) {
                return callback( error, result );
            } else {
                return callback( error, result !== null ? (ref = result.gateways) !== null ? ref.gateway[0].token : void 0 : void 0 );
            }
        });
    };

    // Adds a payment method
    Spreedly.prototype.submit_payment_info = function( callback ) {
        var path = 'payment_methods.xml';

        var data = {
            payment_method: {
                credit_card: {
                    first_name: 'Joe',
                    last_name: 'Jones',
                    number: '5555555555554444',
                    month: '3',
                    year: '2032'
                },
                email: 'joey@example.com',
                data: {
                    my_payment_method_identifier: '448',
                    extra_stuff: {
                        some_other_things: 'Can be anything really'
                    }
                }
            }
        };

        var headers = { 'Authorization': 'Basic ' + new Buffer(this.env_key + ':' + this.api_key).toString('base64') };

        return this.post(path, headers, data, callback);
    };


    Spreedly.prototype.transactions_purchase = function( callback ) {

    };

    Spreedly.prototype.receivers_deliver = function( callback ) {

    };

    return Spreedly;
})();

module.exports = Spreedly;
