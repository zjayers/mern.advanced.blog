import * as actions from '../actions';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import React, { Component } from 'react';

import BlogNew from './blogs/BlogNew';
import BlogShow from './blogs/BlogShow';
import Dashboard from './Dashboard';
import Header from './Header';
import Landing from './Landing';
import { connect } from 'react-redux';

class App extends Component {
  componentDidMount() {
    this.props.fetchUser();
  }

  render() {
    return (
      <div className='container'>
        <BrowserRouter>
          <div>
            <Header />
            <Switch>
              <Route path='/blogs/new' component={BlogNew} />
              <Route exact path='/blogs/:_id' component={BlogShow} />
              <Route path='/blogs' component={Dashboard} />
              <Route path='/' component={Landing} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default connect(null, actions)(App);
