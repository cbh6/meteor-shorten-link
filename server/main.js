import { Meteor } from 'meteor/meteor';
import { Links } from '../imports/collections/links';
import { webApp } from 'meteor/webapp'; // handles requests
import ConnectRoute from 'connect-route';

Meteor.startup(() => {
  Meteor.publish('links', function() {
    return Links.find({});
  });
});

// Executed whenever a user visits with a route like
// localhost:3000/abcd
function onRoute(req, res, next) {
  // take the token out of the url and try to find a matchin link
  // in the Links Collection
  const link = Links.findOne({ token: req.params.token });

  // if we find a link object, redirect the user to the long URL
  Links.update(link, { $inc: { clicks: 1 } });
  if (link) {
    res.writeHead(307, { Location: link.url });
    res.end();
  } else {
    // if we don't find a link object, send the user to our normal React app
    next();
  }
}

// localhost:3000/ NO MATCH
// localhost:3000/books/harry_potter NO MATCH
// localhost:3000/abcd WILL MATCH!!
const middleware = ConnectRoute(function(router) {
  router.get('/:token', onRoute);
});

WebApp.connectHandlers.use(middleware);
