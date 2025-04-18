const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/userModel');
const jwt = require('jsonwebtoken');

const setupAuth = (app) => {
  // Configure session
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === 'production'
    }
  };

  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize/deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Custom JWT auth routes
  app.post('/api/register', async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const userExists = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName
      });
      
      const savedUser = await user.save();
      
      // Create user object without password
      const userForToken = {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName
      };
      
      // Generate JWT token
      const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });
      
      // Login user with passport
      req.login(savedUser, (err) => {
        if (err) return next(err);
        
        // Send response with user and token
        res.status(201).json({
          user: userForToken,
          token
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message || 'Invalid credentials' });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Create user object without password
        const userForToken = {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        };
        
        // Generate JWT token
        const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
          expiresIn: '30d'
        });
        
        // Send response with user and token
        res.json({
          user: userForToken,
          token
        });
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json(req.user);
  });
};

module.exports = setupAuth;