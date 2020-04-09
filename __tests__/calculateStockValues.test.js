"use strict";

//     calculateStockValue.test.js 1.0.0
//     https://github.com/matt3501/CurrentStockValues
//     
//     Licensed under the Apache License, Version 2.0 (the "License");
//     you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
//     
//     Unless required by applicable law or agreed to in writing, software
//     distributed under the License is distributed on an "AS IS" BASIS,
//     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
//     limitations under the License.



describe("CsvUtils Test", () => {
    it("JSON object[] test of CSVUtils.jsonArrayToCSV - Happy path", () => {
        //arrange
        const calculateStockValues = require('../calculateStockValues');
        const fs = require('fs');
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
    it("JSON object[] test of CSVUtils.jsonArrayToCSV - input validation", () => {
        //arrange
        const calculateStockValues = require('../calculateStockValues');
        const fs = require('fs');
        const input = [];
        
        //act
        let jsonArrayToCsv = calculateStockValues.CsvUtils.jsonArrayToCsv(input);

        //assert
        expect(jsonArrayToCsv).toBe("");
    });
});


describe("StockController Tests", () => {
    it("findMinAndMaxFromHistoricalData - Happy path", () => {
        //arrange
        const calculateStockValues = require('../calculateStockValues');
        let stock = new calculateStockValues.PortfolioDisplayItem("test", 10);

        stock.historicalData = JSON.parse("{\"symbol\":\"AAPL\",\"historical\":[{\"date\":\"2015-04-09\"," +
            "\"open\":125.85,\"high\":126.58,\"low\":124.66,\"close\":126.56,\"" +
            "adjClose\":117.09,\"volume\":32484000,\"unadjustedVolume\":3248400" +
            "0,\"change\":-0.71,\"changePercent\":-0.564,\"vwap\":125.93333,\"l" +
            "abel\":\"April 09, 15\",\"changeOverTime\":-0.00564},{\"date\":\"2" +
            "015-04-10\",\"open\":125.95,\"high\":127.21,\"low\":125.26,\"close" +
            "\":127.1,\"adjClose\":117.59,\"volume\":40188000,\"unadjustedVolum" +
            "e\":40188000,\"change\":-1.15,\"changePercent\":-0.913,\"vwap\":12" +
            "6.52333,\"label\":\"April 10, 15\",\"changeOverTime\":-0.00913},{" +
            "\"date\":\"2015-04-13\",\"open\":128.37,\"high\":128.57,\"low\":12" +
            "6.61,\"close\":126.85,\"adjClose\":117.36,\"volume\":36365100,\"un" +
            "adjustedVolume\":36365100,\"change\":1.52,\"changePercent\":1.184," +
            "\"vwap\":127.34333,\"label\":\"April 13, 15\",\"changeOverTime\":0" +
            ".01184}]}");
        let stocksToRetrieve = [stock];

        //act
        let controller = new calculateStockValues.StockController(stocksToRetrieve);
        controller.findMinAndMaxFromHistoricalData(stock);

        //assert
        expect(stock.low).toBe(124.66);
        expect(stock.high).toBe(128.57);
    });
});


describe("Portfolio Tests", () => {
    it("constructor test - Happy path", () => {
        const calculateStockValues = require('../calculateStockValues');

        let stocksToRetrieve = [
            new calculateStockValues.PortfolioDisplayItem("test1", 10, 500.01),
            new calculateStockValues.PortfolioDisplayItem("test2", 10, 499.99),
            new calculateStockValues.PortfolioDisplayItem("test3", 10, 10)
        ];


        //act
        let portfolio = new calculateStockValues.Portfolio(stocksToRetrieve);
        let displayItems = portfolio.displayItems;
        let total = displayItems[displayItems.length - 1];

        //assert
        expect(total.currentValue).toBe(1010);
    });
});


describe("PortfolioDisplayItem Tests", () => {
    it("displayObjects test - Happy path", () => {
        const calculateStockValues = require('../calculateStockValues');

        let shouldBeObjects = {
            "Ticker": "Total",
            "Quantity": 10,
            "Current Price": null,
            "High": null,
            "Low": null,
            "Current Value": null
        };

        //act
        var stock = new calculateStockValues.PortfolioDisplayItem("Total", 10);

        //assert
        expect(JSON.stringify(stock.displayObjects)).toBe(JSON.stringify(shouldBeObjects));
    });
});


describe("Helper method Tests", () => {
    it("Array.prototype.sum test - Happy path", () => {
        const calculateStockValues = require('../calculateStockValues');

        let toBeSummed = [
            { "key": 1, "value": 27 },
            { "key": 1, "value": 22 },
            { "key": 1, "value": 1 }
        ];

        //act
        var sum = toBeSummed.sum("value");

        //assert
        expect(sum).toBe(50);
    });
});

