request = require "request"
#util = require "util"
xml2json = require "xml2json"
#Response_parser = require("./spreedly-response").SpreedlyResponse
easyxml = require "easyxml"
https = require "https"
fs = require "fs"
querystring = require('querystring');

module.exports = class Spreedly

  constructor: (env_key, api_key)->
    @env_key = env_key
    @api_key = api_key
    @url = "https://core.spreedly.com/"
    @version = "v1"

  get: (path, data, callback)->
    options = 
      singularizeChildren: true,
      underscoreAttributes: true,
      rootElement: "request",
      dateFormat: 'ISO',
      indent: 4,
      manifest: false
    easyxml.configure options
    xml = easyxml.render data
    console.log "Sending:", xml
    get_options = 
      host: 'core.spreedly.com',
      path: "/"+@version+"/"+path
      method: 'GET',
      headers: 
        'Authorization': 'Basic ' + new Buffer(@env_key + ':'+@api_key).toString('base64')
        "Content-Type": "application/xml"
        'Content-Length' : Buffer.byteLength(xml, 'utf8')
    body = ""
    error= null
    get_req = https.request get_options, (res)-> 
      res.on 'data', (chunk) ->
        body += chunk
      res.on 'end', ->
        console.log "Response:", body
        json= xml2json.toJson body
        callback error, json 

    get_req.on 'error', ( err ) ->
      error=err

    get_req.write(xml)
    get_req.end()
