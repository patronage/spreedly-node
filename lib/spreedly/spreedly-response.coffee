SpreedlyResponse = ->
util = require("util")
SpreedlyResponse::$unpad = (value) ->
  return parseInt((value + "").substr(1, 1))  if (value + "").indexOf("0") is 0
  parseInt value + ""

SpreedlyResponse::$get_datetime_value = (value) ->
  value = value.substr(0, value.length - 1)
  parts = value.split("T")
  dateParts = parts[0].split("-")
  dateParts[0] = parseInt(dateParts[0])
  dateParts[1] = @$unpad(dateParts[1]) - 1
  dateParts[2] = @$unpad(dateParts[2])
  timeParts = parts[1].split(":")
  timeParts[0] = @$unpad(timeParts[1])
  timeParts[1] = @$unpad(timeParts[1])
  timeParts[2] = @$unpad(timeParts[2])
  new Date(dateParts[0], dateParts[1], dateParts[2], timeParts[0], timeParts[1], timeParts[2])

SpreedlyResponse::$get_typed_value = (value, type) ->
  switch type
    when "boolean"
      value is true
    when "decimal"
      parseFloat value
    when "integer"
      parseInt value
    when "datetime"
      @$get_datetime_value value
    when "array"
      value
    else
      value + ""

SpreedlyResponse::$get_normalized_single = (data) ->
  input = data
  for key of input
    newKey = key
    if key.indexOf("-") > -1
      newKey = key.replace(/-/g, "_")
      input[newKey] = input[key]
      delete input[key]

      key = newKey
    if typeof input[key] isnt "string"
      unless input[key]["$t"] is `undefined`
        unless input[key].type is `undefined`
          input[key] = @$get_typed_value(input[key]["$t"], input[key].type)
        else
          unless input[key].nil is `undefined`
            input[key] = null
          else
            input[key] = input[key]["$t"] + ""
      else
        if input[key].type is `undefined`
          input[key] = null
        else
          unless input[key].nil is `undefined`
            input[key] = null
          else
            if input[key].type is "string"
              input[key] = null
            else
              input[key] = input[key]
  input

SpreedlyResponse::$get_normalized_array = (data) ->
  input = data
  i = 0

  while i < input.length
    input[i] = @$get_normalized_single(input[i])
    i++
  input

SpreedlyResponse::plans_versions_response = (json_input) ->
  input = json_input
  input = [input]  if typeof input is "object" and typeof input.push isnt "function"
  input = @$get_normalized_array(input)
  input

SpreedlyResponse::plans_response = (json_input) ->
  input = json_input
  input["subscription-plans"]["subscription-plan"] = [input["subscription-plans"]["subscription-plan"]]  if typeof input["subscription-plans"]["subscription-plan"] is "object" and typeof input["subscription-plans"]["subscription-plan"].push isnt "function"
  input["subscription-plans"]["subscription-plan"] = @$get_normalized_array(input["subscription-plans"]["subscription-plan"])
  i = 0

  while i < input["subscription-plans"]["subscription-plan"].length
    input["subscription-plans"]["subscription-plan"][i].versions = @plans_versions_response(input["subscription-plans"]["subscription-plan"][i].versions.version)
    i++
  input["subscription-plans"]["subscription-plan"]

exports.SpreedlyResponse = SpreedlyResponse