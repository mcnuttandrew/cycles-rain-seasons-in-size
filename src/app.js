import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import AppState from './reducers/index';
import './stylesheets/main.css';
import Root from './components/root.js';

const extensionContainer = document.createElement('div');
extensionContainer.setAttribute('id', 'root-container');
document.querySelector('body').appendChild(extensionContainer);

ReactDOM.render(
  <Provider store={AppState}>
    <Root />
  </Provider>,
  document.querySelector('#root-container')
);
