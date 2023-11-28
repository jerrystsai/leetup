import { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { maintainSessionThunk } from './store/session';

import Navigation from './components/Navigation';

import SplashPage from './components/SplashPage';
import GroupsList from './components/GroupsList';
import GroupStart from './components/GroupStart';
import GroupDetails from './components/GroupDetails';
import GroupManage from './components/GroupManage';
import EventsList from './components/EventsList';
import EventDetails from './components/EventDetails';

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect( () => {
    setIsLoaded(false);
    dispatch(maintainSessionThunk())
      .then( () => {setIsLoaded(true)} );
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
        {isLoaded && (
        <Switch>
          <Route exact path="/">
            <SplashPage />
          </Route>
          <Route exact path="/groups/new">
            <GroupStart />
          </Route>
          <Route path="/groups/:id">
            <GroupDetails />
          </Route>
          <Route path="/groups/:id/edit">
            <GroupManage />
          </Route>
          <Route path="/events/:id">
            <EventDetails />
          </Route>
          <Route exact path="/groups">
            <GroupsList />
          </Route>
          <Route exact path="/events">
            <EventsList />
          </Route>
        </Switch>
        )}
    </>
  );
};

export default App;
