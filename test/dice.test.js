const DiceExpression = require('./../lib/dice')
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

describe('DiceExpression', function() {
   describe('#new()', function() {
    it("should throw an exception when the expression is not present", function() {
      expect(function () {
        new DiceExpression();
      }).to.throw("The input parameter has not been passed.");
    });

    it("should throw an exception when the expression is not a literal type", function() {
      expect(function () {
        new DiceExpression(456);
      }).to.throw("The input parameter is not a literal type.");
    });

    it("should throw an exception when the expression is not valid", function() {
      expect(function () {
        new DiceExpression("ssss");
      }).to.throw("The input parameter 'ssss' is not valid.");
    });
  });

  describe('#min()', function() {
    it("when pass '2d20 - 7 + 9' then returns 4", function() {
      var de = new DiceExpression('2d20 - 7 + 9')
      expect(de.min()).to.equal(4)
    });
  });

  describe('#max()', function() {
    it("when pass '2d20 - 7 + 9' then returns 42", function() {
      var de = new DiceExpression('2d20 - 7 + 9')
      expect(de.max()).to.equal(42)
    });
  });

  describe('#DiceExpression()', function() {
    it("when pass '3d% - d7 + 19' then returns number", function() {
      var de = new DiceExpression('3d% - d7 + 19')
      var result = de()
      assert.isNumber(result)
    });

    it("when pass '7-4' then returns 3", function() {
      var de = new DiceExpression('7-4')
      expect(de()).to.equal(3)
    });

    it("when pass '1d1' then returns 1", function() {
      var de = new DiceExpression('1d1')
      expect(de()).to.equal(1)
    });

    it("when pass '1d6' then returns number between 1 and 6 inclusevly", function() {
      var de = new DiceExpression('1d6')
      expect(de()).to.be.within(1, 6)
    });
  });

  describe('#roll()', function() {
    it("when pass '1 - 2D6 + 20' then returns object {roll:number, dice:arrayOfNumbers[3]}", function() {
      var de = new DiceExpression('1 - 2D6 + 20')
      var result = de.roll()

      expect(result).to.have.property('roll')
      expect(result).to.have.property('dice')

      assert.isNumber(result.roll)
      assert.isAbove(result.roll, 0)

      assert.isArray(result.dice)
      assert.lengthOf(result.dice, 3)
      assert.strictEqual(result.dice[0], 1)
      assert.strictEqual(result.dice[2], 20)
      assert.isBelow(result.dice[1], 0)
    });

    it("when pass '1000 - 200 - 20' then returns object {roll:780, dice:[1000, -200, -20]]}", function() {
      var de = new DiceExpression('1000 - 200 - 20')
      var result = de.roll()

      expect(result).to.have.property('roll', 780)
      expect(result).to.have.deep.property('dice[0]', 1000)
      expect(result).to.have.deep.property('dice[1]', -200)
      expect(result).to.have.deep.property('dice[2]', -20)
      assert.lengthOf(result.dice, 3)
    });
  });

});
