Spreedly = require("../lib/spreedly/spreedly")

describe "Spreedly", ->

  it "first test", (done) ->
    env_key= "CDjPWtnwXj63cgJjl8CHTRzuzQE"
    api_key= "FFF52ZwK17xLG4BGBFimU4y4C1YjK9yhrCN07o19ogu8bFdeTCu2IOEwKuViLn1Z"
    client = new Spreedly env_key, api_key
    data= #'<gateway><gateway_type>test</gateway_type></gateway>'
      gateway:
        gateway_type:"test"
    client.get "gateways.xml", data, (err, resp)->
      done err
