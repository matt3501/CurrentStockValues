# CurrentStockValues
NM Interview Question

##### TL;DR
This is a NodeJS utility application where a user can provide paired arguments to fetch stock information.

## Usage:

`node calculateStockValues.js AAPL 5 MSFT 10`

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
Total,,,,,"$2,991.20"
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
 PASS  ./calculateStockValues.test.js
  CsvUtils Test
    √ JSON object[] test of CSVUtils.jsonArrayToCSV - Happy path (3ms)
    √ JSON object[] test of CSVUtils.jsonArrayToCSV - input validation

  console.log calculateStockValues.js:274
    required as a module

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        7.405s
Ran all test suites.
Done in 12.15s.

```