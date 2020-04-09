# CurrentStockValues
NM Interview Question

##### TL;DR
This is a NodeJS utility application where a user can provide paired arguments to fetch stock information.

## Usage:

`node calculateStockValues.js AAPL 5 MSFT 10 AMZN 15`

Output:

`called directly`
`File is saved.`

File:

`testStockOutput.csv`

Contents

```
Ticker,Quantity,Current Price,High,Low,Current Value
AAPL,5,$267.96,$327.85,$142.00,"$1,339.80"
MSFT,10,$165.14,$190.70,$97.20,"$1,651.40"
AMZN,15,"$2,040.80","$2,185.95","$1,460.93","$30,612.00"
Total,,,,,"$33,603.20"
```

## Documentation

After cloning the solution, checkout the docs/calculateStockValues.html file for an annotated source

## Setup

The following items were needed to get up and running on a Windows 10 x64 machine

 *  nodeJS
   * https://nodejs.org/en/download/
 *  yarn
 *  jest
 *  docco

With all of those installed, follow the initialization instructions on jest's website:

https://jestjs.io/docs/en/getting-started

## Run the tests

To run the tests included, run the following commands:

`yarn test`

This will output something similar to the following:


```

yarn run v1.22.4
$ jest
 PASS  __tests__/calculateStockValues.test.js
  Helper method Tests
    √ Array.prototype.sum test - Happy path (148ms)
  PortfolioDisplayItem Tests
    √ displayObjects test - Happy path (1ms)
  Portfolio Tests
    √ constructor test - Happy path
  StockController Tests
    √ findMinAndMaxFromHistoricalData - Happy path (1ms)
  CsvUtils Test
    √ JSON object[] test of CSVUtils.jsonArrayToCSV - Happy path (1ms)
    √ JSON object[] test of CSVUtils.jsonArrayToCSV - input validation

  console.log calculateStockValues.js:287
    required as a module

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        7.191s
Ran all test suites.
Done in 11.86s.

```