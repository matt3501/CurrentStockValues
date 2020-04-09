"use strict";

//     calculateStockValue.js 1.0.0
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

// Includes for the project
const https = require("https");
const fs = require("fs");
// Attempt to be internationalizable, however would need a better mechanism to
// set dynamically based on use context.
const Language = require("./language.en.resources");

// Helper extension methods
// --------------
Array.prototype.sum = function (prop) {
    let total = 0;
    for (let i = 0, _len = this.length; i < _len; i++) {
        total += this[i][prop];
    }
    return total;
}


// Support Classes
// --------------

// Holds values associated to one entry in a portfolio.
// Can be used either to hold stock information or as a total.
// 
// Stock usage declaration:
// `new PortfolioDisplayItem("STOK", 77);`
// Total usage declaration:
// `new PortfolioDisplayItem("Total", null, "$10,000");`
class PortfolioDisplayItem {
    // Create an item to be displayed in a portfolio.
    // quantity (for stocks) and currentValue (for totals) alternate
    // as null depending on their use
    constructor(ticker, quantity, currentValue) {
        this.ticker = ticker;
        this.quantity = quantity == null ? null : quantity;
        this.currentPrice = null;
        this.high = null;
        this.low = null;
        this.currentValue = currentValue == null ? null : currentValue;
    }

    // Get the objects needed for display returned.
    get displayObjects() {
        const obj = {};
        obj[Language.ticker] = this.ticker;
        obj[Language.quantity] = this.quantity;
        obj[Language.currentPrice] = PortfolioDisplayItem.toPrettyMoney(this.currentPrice);
        obj[Language.high] = PortfolioDisplayItem.toPrettyMoney(this.high);
        obj[Language.low] = PortfolioDisplayItem.toPrettyMoney(this.low);
        obj[Language.currentValue] = PortfolioDisplayItem.toPrettyMoney(this.currentValue);

        return obj;
    }

    // Convert a string containing two formatted USD with en-US comma/dot rules
    static toPrettyMoney(value) {
        if (!value)
            return value;
        else
            return new Intl.NumberFormat("en-US",
                { style: "currency", currency: "USD" }
            ).format(value);
    }
}


// Class for holding a collection of stocks and/or totals of stocks
class Portfolio {
    constructor(stocks) {
        this.stocks = stocks;

        let currentTotal = stocks.sum("currentValue");

        stocks.push(new PortfolioDisplayItem("Total", null, currentTotal));
    }
    // Returns all members of the portfolio (stocks and totals)
    get displayItems() {
        return this.stocks;
    }
}

// These are some static values for accessing the API.
const API_URL = "financialmodelingprep.com";
const HISTORICAL_STOCK_START_DATE = "2019-01-01";
const TODAY = new Date().toISOString().slice(0, 10);
const stockOutputCsvPath = "testStockOutput.csv";

// Class for interfacing to a remote stock API hosted here:
// https://financialmodelingprep.com
class StockApiConsumer {
    // Places an API request to retrieve the current price.
    // This is a live value and will update often when the markets are open.
    static requestCurrentPriceForTicker(ticker) {
        return new Promise(resolve => {
            resolve(this.placeApiRequest("/api/v3/stock/real-time-price/" + ticker));
        });
    }
    // Places an API request to retrieve previous values from 
    // HISTORICAL_STOCK_START_DATE until TODAY.
    // 
    // This return value updates daily at the end of each market close.
    static requestHistoricalDailyPriceForTicker(ticker) {
        return new Promise(resolve => {
            resolve(this.placeApiRequest("/api/v3/historical-price-full/" + ticker
                + "?from=" + HISTORICAL_STOCK_START_DATE + "&to=" + TODAY));
        });
    }
    // Reusable API method that takes any path.  More paths can be found at 
    // https://financialmodelingprep.com
    static placeApiRequest(path) {
        return new Promise(resolve => {
            let options = {
                host: API_URL,
                port: 443,
                path: path,
                method: "GET"
            };

            let chunks = "";

            https.request(options, function (res) {
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    chunks += chunk;
                });
                // Funny story, turns out you need to wait until the end for large responses.
                res.on("end",
                    function () {
                        const result = JSON.parse(chunks);
                        resolve(result);
                    });
            }).end();
        });
    }
}

// This is used for performing business logic on retrieved stock information.
class StockController {
    // Pretty standard constructor, where stocksToRetrieve is type `PortfolioDisplayItem`
    constructor(stocksToRetrieve) {
        this.stocksToRetrieve = stocksToRetrieve;
    }
    // Intended to have `outputDataToCSV` called right after with the provided
    // `callback`
    calculateStockValue(callback) {
        const self = this;

        const promises = self.stocksToRetrieve.map((stock) => {
            return self.initializeStockProperties(stock, self);
        });

        Promise.all(promises).then(function () { callback(self); });
    }
    // The calls to `StockApiConsumer` are static, just have to wait for them 
    // to return before performing the calculations for stock attributes.
    async initializeStockProperties(stock, self) {
        const currentPrice = await StockApiConsumer.requestCurrentPriceForTicker(stock.ticker);
        const historicalResult = await StockApiConsumer.requestHistoricalDailyPriceForTicker(stock.ticker);

        stock.currentPrice = currentPrice.price;
        stock.currentValue = stock.currentPrice * stock.quantity;
        stock.historicalData = historicalResult;

        self.findMinAndMaxFromHistoricalData(stock);
    }
    // Bases its entire calculation on the `stock.historicalData.historical`
    // property, so make sure it's set before calling.
    findMinAndMaxFromHistoricalData(stock) {
        let lowest = Number.POSITIVE_INFINITY;
        let highest = Number.NEGATIVE_INFINITY;
        let tmp;
        const historicalData = stock.historicalData.historical;
        for (let i = historicalData.length - 1; i >= 0; i--) {
            tmp = historicalData[i];
            if (tmp.low < lowest) lowest = tmp.low;
            if (tmp.high > highest) highest = tmp.high;
        }
        stock.high = highest;
        stock.low = lowest;
    }
    // Package the data to CSV format and write to a local file at path:
    // `stockOutputCsvPath` for now.
    outputDataToCSV(self) {
        let portfolio = new Portfolio(self.stocksToRetrieve);

        let displayArray = [];

        portfolio.displayItems.forEach((item) => {
            displayArray.push(item.displayObjects);
        });

        let csv = CsvUtils.jsonArrayToCsv(displayArray);
        
        CsvUtils.writeToFile(stockOutputCsvPath, csv);
    }
}

// Utility class created to form and write CSV data
class CsvUtils {
    // Takes an `array[]` of json and uses the first item to determine columns.
    // Then for each item in the array, the values are concatenated, and if a
    // comma exists in any key, the value is escaped with surrounding quotes.
    static jsonArrayToCsv(jsonObjects) {
        let csvRows = [];

        if (!Array.isArray(jsonObjects) || !jsonObjects.length) {
            return "";
        }

        let tokenHeaders = Object.keys(jsonObjects[0]).join(",");

        csvRows.push(tokenHeaders);

        jsonObjects.forEach(function (singleRow) {
            for (let [key, value] of Object.entries(singleRow)) {
                if (value !== null && value) {
                    if ((value + "").indexOf(",") > -1)
                        singleRow[key] = "\"" + value + "\"";
                }
            }

            csvRows.push(Object.values(singleRow).join(","));
        });

        let csv = `${csvRows.join('\r\n').replace(/,/g, ',')}`;
        return csv;
    }
    // Using `fs`, writes the string locally to the path provided.
    static writeToFile(fileName, csv) {
        fs.writeFile(fileName, csv, "utf8", function (err) {
            if (err) {
                console.log("Unable to write file.");
            } else {
                console.log("File is saved.");
            }
        });
    }
}

// Self executing entry point, arguments processed here or defaults are used
// (or nothing happens if through 'require').
(function () {
    // Make sure someone is intending to run this via 
    // `node calculateStockValues.js` and not through a `require` statement.
    if (require.main === module) {
        console.log('called directly');
        let myArgs = process.argv.slice(2);

        let stocksToRetrieve = [];

        // Create some default arguments if none are provided.
        if (myArgs === undefined || myArgs.length === 0) {
            stocksToRetrieve = [
                new PortfolioDisplayItem("AMZN", 42),
                new PortfolioDisplayItem("MSFT", 1337),
                new PortfolioDisplayItem("TWTR", 69105)
            ];
        // Else make sure the arguments come in pairs 
        } else if (myArgs.length % 2 === 0) {
            for (let i = 0; i < myArgs.length; i += 2) {
                stocksToRetrieve.push(new PortfolioDisplayItem(myArgs[i], myArgs[i + 1]));
            }
        }

        if (stocksToRetrieve.length > 0) {
            let controller = new StockController(stocksToRetrieve);
            controller.calculateStockValue(controller.outputDataToCSV);
        }
    } else {
        // Else the module was included with a `require` statement.
        console.log('required as a module');
    }

})();


// Make these modules publicly accessible. 
module.exports = {
    PortfolioDisplayItem: PortfolioDisplayItem,
    Portfolio: Portfolio,
    StockApiConsumer: StockApiConsumer,
    StockController: StockController,
    CsvUtils: CsvUtils
} 
