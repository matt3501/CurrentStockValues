# CurrentStockValues
NM Interview Question

##### TL;DR
This is a NodeJS utility application where a user can provide paired arguments to fetch stock information.

Usage:

`node calculateStockValues.js AAPL 5 MSFT 10`

Output:

`called directly`
`File is saved.`

File:

`testStockOutput.csv`

Contents

```
Ticker,Quantity,Current Price,High,Low,Current Value
AMZN,42,"$2,044.92","$2,185.95","$1,460.93","$85,886.64"
MSFT,1337,$166.12,$190.70,$97.20,"$222,102.44"
TWTR,69105,$28.97,$45.86,$20.00,"$2,001,626.33"
Total,,,,,"$2,309,615.41"
```

## Setup

The following items were needed to get up and running on a Windows 10 x64 machine

 *  nodeJS
 *  yarn
 *  docco

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