# Dice.js

This is designed to emulate to roll the dice.

## API

See ./docs

## Usage

### node.js

In your project, run the following command:

    npm install org.dsu.dice

In your code:

    var DiceExpression = require('org.dsu.dice')
    var 2d6 = new DiceExpression('2d6')

    2d6() // 7
    2d6() // 11
    2d6.min() // 2
    2d6.max() // 12
    2d6.roll() // { roll: 7, dice: [7] };

## Testing

To run tests in node.js:

  npm install -g mocha
  npm test

