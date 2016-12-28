(function (root) {
  "use strict"

  const GLOBAL_KEY = "DiceExpression"
  const Random = require("random-js")

  /**
 * Creates a DiceExpression.<br>
 * The DiceExpression is defined as follows:<br>
 * DiceExpression => Integer.<br>
 * DiceExpression => x?(d|D)y where x is the # of dice and y the sides.<br>
 * DiceExpression => x?(d|D)% where x is the # of dice and '%' = 100.<br>
 * DiceExpression => DiceExpression +/- DiceExpression.
 * @constructor
 * @param {string} inputExpression - The input value of the expression.
 * @throws {Error} Will throw an error if the argument is null or has an invalid format.
 * @example
 * var de = new DiceExpression('2d10 + d6 - 7 + 2')
 * @return {Function}  The returned function generates next rolled value.
 * @example
 * var de = new DiceExpression('2d10 + d6 - 7 + 2')
 * de() // 12
 */
  function DiceExpression (inputExpression) {
    //console.log(`DiceExpression: The input expression - ${inputExpression}`);
    if (!inputExpression) {
      throw new Error("The input parameter has not been passed.")
    }
    if (typeof inputExpression !== 'string') {
      throw new Error("The input parameter is not a literal type.")
    }

    var expression = inputExpression.replace(/\s/g, '')

    // define regexp patterns
    const nodeRegExpPattern = "(" + "\\d{1,8}(?![Dd\\d])" + "|" + "\\d{0,4}[dD](\\d{1,4}|%)" + ")"
    const validationRegExPattern = "^" + nodeRegExpPattern + "([\\+\\-]" + nodeRegExpPattern + ")*$"

    // check expression is valid, it is not then throw exception
    if (!expression.match(new RegExp(validationRegExPattern, "g"))) {
      throw new Error(`The input parameter '${inputExpression}' is not valid.`)
    }

    // find nodes in expression
    var nodes = function() {
      var retArray = []
      var nodeRegExp = new RegExp(nodeRegExpPattern, "g")
      var result
      while (result = nodeRegExp.exec(expression)) {
        retArray.push(
          {
            sign : result.index == 0 ? '+' : expression.charAt(result.index - 1),
            item : result[0]
          }
        );
      }
      return retArray
    }();

    // convert nodes to dices and calc min and max values
    var min = 0
    var max = 0
    var dices = function() {
      var retArray = nodes.map(function(node) {
        var k = (node.sign == '+' ? 1 : -1)
        var diceCnt = 0
        var sideCnt = 0

        if (!isNaN(node.item)) {
          sideCnt = +node.item
          min += sideCnt * k
          max += sideCnt * k
        } else {
          var diceProps = node.item.split(/[dD]/)
          if (diceProps[0]) {
            diceCnt = +diceProps[0]
          } else {
            diceCnt = 1
          }
          if (diceProps[1] == "%") {
            sideCnt = 100
          } else {
            sideCnt = +diceProps[1]
          }
          min += diceCnt * k
          max += diceCnt * sideCnt * k
        }

        return {
          op : k,
          dices : diceCnt,
          sides : sideCnt
        };
      });

      return retArray
    }();

    const random = new Random(Random.engines.mt19937().autoSeed())
    var _roll = function() {
      var _rollDice = function (dice) {
        if (dice.dices == 0) {
          return dice.sides * dice.op
        }

        var rolledValue = 0
        Array(dice.dices).fill().map(_ => {
          rolledValue += random.integer(1, dice.sides)
        });
        return rolledValue * dice.op
      }

      var rolledValues = dices.map(function(dice) {
        return _rollDice(dice)
      });
      return rolledValues
    }

    // define public interface
    var _diceExpression = function() {
      return _roll().reduce(function(previousValue, currentValue) {
        return previousValue + currentValue
      });
    }

    /** @memberof DiceExpression#
    * @return {number} Returns the minimum rolled value.
    * @example
    * var de = new DiceExpression('2d10 + d6 - 7 + 2')
    * de.min() // 3
    */
    _diceExpression.min = function() {
      return min
    }

    /** @memberof DiceExpression#
    * @return {number} Returns the maximum
    * rolled value.
    * @example
    * var de = new DiceExpression('2d10 + d6 - 7 + 2')
    * de.max() // 21
    */
    _diceExpression.max = function() {
      return max
    }

    /** Generates next rolled values.
    * @memberof DiceExpression#
    * @return {Roll} obj - Returns the object of rolled values.
    * @example
    * var de = new DiceExpression('2d10 + d6 - 7 + 2')
    * de.roll() // { roll: 8, dice: [10, 3, -7, 2] }
    */
    _diceExpression.roll = function() {
      var rollResult = _roll()

      /**
       * The object represents the relust of rolling.
       * @typedef {Object} Roll
       * @property {number} roll - The rolled value.
       * @property {Array} dice - The array of rolled dices.
       */
      return {
        roll : rollResult.reduce(function(previousValue, currentValue) {
          return previousValue + currentValue
        }),
        dice : rollResult
      };
    }

    return _diceExpression
  }

  // export
  if (typeof define === "function" && define.amd) {
    define(function () {
      return DiceExpression;
    });
  } else if (typeof module !== "undefined" && typeof require === "function") {
    module.exports = DiceExpression;
  } else {
    (function () {
      var oldGlobal = root[GLOBAL_KEY];
      DiceExpression.noConflict = function () {
        root[GLOBAL_KEY] = oldGlobal;
        return this;
      };
    }());
    root[GLOBAL_KEY] = DiceExpression;
  }
}(this));
