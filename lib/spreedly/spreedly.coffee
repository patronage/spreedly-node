request = require "request"
#util = require "util"
xml2json = require "xml2json"
#Response_parser = require("./spreedly-response").SpreedlyResponse
easyxml = require "easyxml"
https = require "https"
fs = require "fs"
querystring = require 'querystring'
extend = require "xtend"

module.exports = class Spreedly

  constructor: (env_key, api_key)->
    @env_key = env_key
    @api_key = api_key
    @url = "https://core.spreedly.com/"
    @version = "v1"

    options = 
      singularizeChildren: true,
      underscoreAttributes: true,
      rootElement: null,
      dateFormat: 'ISO',
      indent: 4,
      manifest: false
      
    easyxml.configure options

  json_to_xml: (json)->
    xml = easyxml.render json
    
    return xml

  get: (path, headers, data, callback)->
    @request "GET", path, headers, data, callback

  post: (path, headers, data, callback)->
    @request "POST", path, headers, data, callback

  request: (method, path, headers, data, callback)->
    console.log "rendering data:", data
    xml = @json_to_xml data
    console.log "Sending:", xml
    options = 
      host: 'core.spreedly.com'
      path: "/"+@version+"/"+path
      method: method
      headers: 
        "Content-Type": "application/xml"
        'Content-Length' : Buffer.byteLength(xml, 'utf8')

    options.headers = extend options.headers, headers
    body = ""
    error= null
    console.log "request options:", options
    get_req = https.request options, (res)-> 
      res.on 'data', (chunk) ->
        body += chunk
      res.on 'end', ->
        console.log "Got Result:", body
        json= xml2json.toJson body
        result = JSON.parse json 
        console.log "Converted Result:", result
        callback error, result 

    get_req.on 'error', ( err ) ->
      error=err

    get_req.write(xml)
    get_req.end()

  get_payment_token: (callback)->
    path = "gateways.xml"

    data=
      gateway:
        gateway_type:"test"

    headers=
      'Authorization': 'Basic ' + new Buffer(@env_key + ':'+@api_key).toString('base64')
    @get path, headers, data, (err, result)->
      return callback err, result if err
      callback err, result?.gateways?.gateway[0].token

  submit_payment_info: (callback)->
    path = "payment_methods.xml"

    data=
      payment_method:
        credit_card:
          first_name: "Joe"
          last_name: "Jones"
          number: "5555555555554444"
          month : "3"
          year: "2032"
        email: "joey@example.com"
        data:
          my_payment_method_identifier: "448"
          extra_stuff:
            some_other_things: "Can be anything really"
            
    headers=
      'Authorization': 'Basic ' + new Buffer(@env_key + ':'+@api_key).toString('base64')
      
    @post path, headers, data, callback

