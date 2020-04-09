"use strict";

/*

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

const StockApiConsumer = require('./calculateStockValues').StockApiConsumer;
const mockPlaceApiRequest = require('./calculateStockValues').mockPlaceApiRequest;


const calculateStockValues = require('./calculateStockValues');

var fs = require('fs');

describe("CsvUtils Test", () => {
    test("JSON object[] test of CSVUtils.jsonArrayToCSV - Happy path", () => {
        //arrange
        const input = [
            { "Ticker": "AAPL", "Quantity": "5", "Current Price": "$315.11", "High": "$323.33", "Low": "$142.00", "Current Value": "$1,575.53" },
            { "Ticker": "SPY", "Quantity": "10", "Current Price": "$326.61", "High": "$327.39", "Low": "$242.60", "Current Value": "$3,266.10" },
            { "Ticker": "KMI", "Quantity": "15", "Current Price": "$21.49", "High": "$21.88", "Low": "$15.10", "Current Value": "$322.35" },
            { "Ticker": "Total", "Quantity": null, "Current Price": null, "High": null, "Low": null, "Current Value": "$5,163.98" }
        ];
        var exampleOutput = fs.readFileSync('ExampleOutput.csv', 'utf8');

        //act
        let jsonArrayToCsv = calculateStockValues.CsvUtils.jsonArrayToCsv(input);

        //assert
        expect(jsonArrayToCsv).toBe(exampleOutput);
    });
    test("JSON object[] test of CSVUtils.jsonArrayToCSV - input validation", () => {
        //arrange
        const input = [];
        
        //act
        let jsonArrayToCsv = calculateStockValues.CsvUtils.jsonArrayToCsv(input);

        //assert
        expect(jsonArrayToCsv).toBe("");
    });
});
