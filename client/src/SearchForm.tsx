import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios, { CancelTokenSource  } from 'axios';
import './SearchForm.css'

interface User {
  email: string;
  number: string;
}

function SearchForm() {
  const [email, setEmail] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isNumberValid, setIsNumberValid] = useState<boolean>(true);
  const [currentRequest, setCurrentRequest] = useState<CancelTokenSource | null>(null);


  const formatNumber = (input: string): string => {
    const value = input.replace(/\D/g, '');
    const valueArray = value.split('');
    const formattedValue: string[] = [];

    for (let i = 0; i < valueArray.length; i++) {
      if (i > 0 && i % 2 === 0) {
        formattedValue.push('-');
      }
      formattedValue.push(valueArray[i]);
    }

    return formattedValue.join('');
  };



  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const inputValue: string = e.target.value;
    const maxLengthValue: string = inputValue.slice(0, 8);
    const numericValue: string = maxLengthValue.replace(/\D/g, '');
    const formattedValue: string = formatNumber(numericValue);
    setNumber(formattedValue);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
  
  
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setIsEmailValid(false);
      return;
    }

    const numberWithoutDashes: string = number.replace(/-/g, '');


    if (numberWithoutDashes.length > 0 && numberWithoutDashes.length < 6) {
      setIsEmailValid(true); 
      setIsNumberValid(false);
      return;
    }

    setIsNumberValid(true);

    if (currentRequest) {
      currentRequest.cancel('Request canceled');
    }

    const newCancelTokenSource = axios.CancelToken.source();
    setCurrentRequest(newCancelTokenSource);

    setTimeout(()=>{
      setIsLoading(true);
    }, 100)

    try {
      const response = await axios.post('http://localhost:3001/search', { email, number: numberWithoutDashes }, {
        cancelToken: newCancelTokenSource.token,
      });

      
      const formattedResults: User[] = response.data.message.map((user: User) => ({
        email: user.email,
        number: formatNumber(user.number),
      }));
      setSearchResults(formattedResults);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Запрос был отменен');
      } else {
        console.error(error);
      }
    } finally {
      setIsLoading(false); 
    }
  };

  
  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
      <div>
          <label className="label">Email:</label>
          <input
            type="text"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              setIsEmailValid(true);
            }}
            required
            className="input-field"
          />
          {!isEmailValid && <p className="error-message">Некорректный email адрес</p>}
        </div>
        <div>
          <label className="label">Number:</label>
          <input
            type="text"
            value={number}
            onChange={handleNumberChange}
            placeholder="XX-XX-XX"
            className="input-field"
          />
          {!isNumberValid && <p className="error-message">Длина должна быть не менее 6 цифр</p>}
        </div>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>

      {isLoading && <p className="loading">Loading...</p>}
      {searchResults.length > 0 && (
        <div className="results-container">
          <p className="results-title">Search Results:</p>
          {searchResults.map((user: User, index: number) => (
            <div key={index} className="result-item">
              <p>Email: {user.email}</p>
              <p>Number: {user.number}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchForm;
