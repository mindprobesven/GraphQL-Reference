import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import CreateLink from '../components/CreateLink'
import Header from '../components/Header'
import LinkList from '../components/LinkList'
import Login from '../components/Login'
import Search from '../components/Search'

class App extends Component {
  componentDidMount = () => {
    // console.log('Book Examples')
  }

  redirect = () => <Redirect to="/new/1" />

  render() {
    return (
      <div className="center w85">
        <Header />
        <div className="ph3 pv1 background-gray">
          <Switch>
            <Route exact path="/" render={() => this.redirect()} />
            <Route exact path="/new/:page" component={LinkList} />
            <Route exact path="/create" component={CreateLink} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/search" component={Search} />
            <Route exact path="/top" component={LinkList} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App
