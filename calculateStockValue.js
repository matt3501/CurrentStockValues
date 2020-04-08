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

// Public
module.exports = calculateStockValue;

const https = require("https");

class Stock {
	constructor(ticker, quantity) {
		this.ticker = ticker;
		this.quantity = quantity;
	}
	sayHello() {
		console.log("Hello, my name is " + this.ticker + ", I have quantity: " + this.quantity
			+ " and current price: " + this.currentPrice
			+ " and high: " + this.high
			+ " and low: " + this.low
			+ " and current Value: " + this.currentValue);
	}
	async initializeStockProperties() {
		this.currentPrice = 0.0;
		this.high = 0.0;
		this.low = 0.0;
		this.currentValue = 0.0;

		var api = new StockApiConsumer();

		const result = await api.requestCurrentPriceForTicker(this.ticker);

        this.currentPrice = result;

    }
}

const url = "financialmodelingprep.com";

class StockApiConsumer {
	requestCurrentPriceForTicker(ticker) {
        return new Promise(resolve => {

		    ////historical funness
		    // var options = {
		    // host: url,
		    // port: 443,
		    // path: '/api/v3/historical-price-full/index/' + this.ticker,
		    // method: 'GET'
		    // };

		    // https.request(options, function(res) {
		    // console.log('STATUS: ' + res.statusCode);
		    // console.log('HEADERS: ' + JSON.stringify(res.headers));
		    // res.setEncoding('utf8');
		    // res.on('data', function (chunk) {
		    // var result = JSON.parse(chunk);
		    // });
		    // }).end();

		    var options = {
			    host: url,
			    port: 443,
			    path: "/api/v3/stock/real-time-price/" + ticker,
			    method: "GET"
		    };

		    // console.log(options.host + options.path);
		    var self = this;
		    https.request(options, function (res) {
			    // console.log('STATUS: ' + res.statusCode);
			    // console.log('HEADERS: ' + JSON.stringify(res.headers));
			    res.setEncoding("utf8");
			    res.on("data", function (chunk) {
				    var result = JSON.parse(chunk);
				    resolve(result.price);
				    //self.currentPrice = result.price;

				    //self.currentValue = result.price * self.quantity;

				    //self.sayHello();
			    });
		    }).end();
        });
	}
}

function calculateStockValue(stocksToRetrieve) {
	stocksToRetrieve.forEach(function (stock) {
		stock.initializeStockProperties();
        stock.sayHello();
    });
}

// init
(function () {
	var myArgs = process.argv.slice(2);

	var stocksToRetrieve;

    if (myArgs === undefined || myArgs.length === 0) {
        stocksToRetrieve = [
            new Stock("AMZN", 42),
            new Stock("MSFT", 1337),
            new Stock("TWTR", 69105)
        ];
	} else if (myArgs.length % 2 === 0) {
        stocksToRetrieve = [];
        for (var i = 0; i < myArgs.length; i += 2) {
			stocksToRetrieve.push(new Stock(myArgs[i], myArgs[i + 1]));
		}
	}

	if (stocksToRetrieve.length > 0) {
        calculateStockValue(stocksToRetrieve);
    }
})();

