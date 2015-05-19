var SpreedlyResponse, util;

SpreedlyResponse = function() {};

util = require("util");

SpreedlyResponse.prototype.$unpad = function(value) {
  if ((value + "").indexOf("0") === 0) {
    return parseInt((value + "").substr(1, 1));
  }
  return parseInt(value + "");
};

SpreedlyResponse.prototype.$get_datetime_value = function(value) {
  var dateParts, parts, timeParts;
  value = value.substr(0, value.length - 1);
  parts = value.split("T");
  dateParts = parts[0].split("-");
  dateParts[0] = parseInt(dateParts[0]);
  dateParts[1] = this.$unpad(dateParts[1]) - 1;
  dateParts[2] = this.$unpad(dateParts[2]);
  timeParts = parts[1].split(":");
  timeParts[0] = this.$unpad(timeParts[1]);
  timeParts[1] = this.$unpad(timeParts[1]);
  timeParts[2] = this.$unpad(timeParts[2]);
  return new Date(dateParts[0], dateParts[1], dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
};

SpreedlyResponse.prototype.$get_typed_value = function(value, type) {
  switch (type) {
    case "boolean":
      return value === true;
    case "decimal":
      return parseFloat(value);
    case "integer":
      return parseInt(value);
    case "datetime":
      return this.$get_datetime_value(value);
    case "array":
      return value;
    default:
      return value + "";
  }
};

SpreedlyResponse.prototype.$get_normalized_single = function(data) {
  var input, key, newKey;
  input = data;
  for (key in input) {
    newKey = key;
    if (key.indexOf("-") > -1) {
      newKey = key.replace(/-/g, "_");
      input[newKey] = input[key];
      delete input[key];
      key = newKey;
    }
    if (typeof input[key] !== "string") {
      if (input[key]["$t"] !== undefined) {
        if (input[key].type !== undefined) {
          input[key] = this.$get_typed_value(input[key]["$t"], input[key].type);
        } else {
          if (input[key].nil !== undefined) {
            input[key] = null;
          } else {
            input[key] = input[key]["$t"] + "";
          }
        }
      } else {
        if (input[key].type === undefined) {
          input[key] = null;
        } else {
          if (input[key].nil !== undefined) {
            input[key] = null;
          } else {
            if (input[key].type === "string") {
              input[key] = null;
            } else {
              input[key] = input[key];
            }
          }
        }
      }
    }
  }
  return input;
};

SpreedlyResponse.prototype.$get_normalized_array = function(data) {
  var i, input;
  input = data;
  i = 0;
  while (i < input.length) {
    input[i] = this.$get_normalized_single(input[i]);
    i++;
  }
  return input;
};

SpreedlyResponse.prototype.plans_versions_response = function(json_input) {
  var input;
  input = json_input;
  if (typeof input === "object" && typeof input.push !== "function") {
    input = [input];
  }
  input = this.$get_normalized_array(input);
  return input;
};

SpreedlyResponse.prototype.plans_response = function(json_input) {
  var i, input;
  input = json_input;
  if (typeof input["subscription-plans"]["subscription-plan"] === "object" && typeof input["subscription-plans"]["subscription-plan"].push !== "function") {
    input["subscription-plans"]["subscription-plan"] = [input["subscription-plans"]["subscription-plan"]];
  }
  input["subscription-plans"]["subscription-plan"] = this.$get_normalized_array(input["subscription-plans"]["subscription-plan"]);
  i = 0;
  while (i < input["subscription-plans"]["subscription-plan"].length) {
    input["subscription-plans"]["subscription-plan"][i].versions = this.plans_versions_response(input["subscription-plans"]["subscription-plan"][i].versions.version);
    i++;
  }
  return input["subscription-plans"]["subscription-plan"];
};

exports.SpreedlyResponse = SpreedlyResponse;
