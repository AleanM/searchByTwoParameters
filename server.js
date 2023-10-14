"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cors = require('cors');
var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var path = require('path');
var axios_1 = require("axios");
var app = express();
var port = 3001;
app.use(bodyParser.json());
app.use(cors());
var processing = false;
var currentRequest = null; // объявите переменную currentRequest
var usersFilePath = path.join(__dirname, 'users.json');
function readUsersFromFile() {
    try {
        var data = fs.readFileSync(usersFilePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Ошибка чтения файла users.json:', error);
        return [];
    }
}
var users = readUsersFromFile();
app.post('/search', function (req, res) {
    var _a = req.body, email = _a.email, number = _a.number;
    // Отмена предыдущего запроса
    if (processing) {
        processing = false;
        if (currentRequest) {
            currentRequest.cancel('Request canceled');
        }
    }
    if (req.destroyed) {
        console.log('Запрос был отменен на сервере');
        return;
    }
    processing = true;
    currentRequest = axios_1.default.CancelToken.source(); // создайте новый CancelTokenSource
    setTimeout(function () {
        var searchResults = users.filter(function (user) {
            if (email && email !== '' && user.email !== email) {
                return false;
            }
            if (number && number !== '' && user.number !== number) {
                return false;
            }
            return true;
        });
        res.json({ message: searchResults });
        processing = false;
    }, 5000);
});
app.listen(port, function () {
    console.log("\u0421\u0435\u0440\u0432\u0435\u0440 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043D\u0430 \u043F\u043E\u0440\u0442\u0443 ".concat(port));
});
