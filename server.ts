import { Application, Request, Response, NextFunction } from 'express';
const cors = require('cors')
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const path = require('path');
import axios, { CancelTokenSource } from 'axios';

const app: Application = express();
const port: number = 3001;

app.use(bodyParser.json());

app.use(cors());

let processing: boolean = false;
let currentRequest: CancelTokenSource | null = null; // объявите переменную currentRequest

interface User {
  email: string;
  number: string;
}

const usersFilePath = path.join(__dirname, 'users.json');

function readUsersFromFile(): User[] {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Ошибка чтения файла users.json:', error);
    return [];
  }
}

const users: User[] = readUsersFromFile();

app.post('/search', (req: Request, res: Response) => {
  const { email, number }: { email: string, number: string } = req.body;

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

  currentRequest = axios.CancelToken.source(); // создайте новый CancelTokenSource

  setTimeout(() => {
    const searchResults: User[] = users.filter((user: User) => {
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

app.listen(port, () => {
  console.log(`Сервер работает на порту ${port}`);
});
