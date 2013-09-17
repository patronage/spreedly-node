should = require 'should'

Spreedly = require("../lib/spreedly/spreedly")

ENV_KEY= "CDjPWtnwXj63cgJjl8CHTRzuzQE"
API_KEY= "FFF52ZwK17xLG4BGBFimU4y4C1YjK9yhrCN07o19ogu8bFdeTCu2IOEwKuViLn1Z"

describe "Spreedly", ->


  #get token
  before (done) ->
    #console.log "Get token"
    @client= new Spreedly ENV_KEY, API_KEY
    done()

  it "get payment token", (done) ->
    @client.get_payment_token (err, token)=>
      should.exist token
      done err

  it "basic payment", (done) ->
    @client.submit_payment_info (err, resp)->
      console.log "Result:", JSON.stringify resp,null,4
      token =resp.transaction?.token
      should.exist(token)
      done err
