import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AuthPage from '../components/pages/AuthPage';
import AthleteDashboard from '../components/Dashboards/AthleteDashboard/AthleteDashboard';
import CoachDashboard from '../components/Dashboards/CoachDashboards/CoachDashboard';

const AppRoutes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={AuthPage} />
        <Route path="/athlete-dashboard" component={AthleteDashboard} />
        <Route path="/coach-dashboard" component={CoachDashboard} />
      </Switch>
    </Router>
  );
};

export default AppRoutes;
