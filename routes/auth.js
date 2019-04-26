const express = require('express');

const firebaseClient = require('../connection/firebase_client');

const router = express.Router();
const firebaseAuth = firebaseClient.auth();

/* GET signin page. */
router.get('/', (req, res) => {
  console.log(`status: ${req.flash('error')},${req.url}`);
  res.render('dashboard/signin', { title: '登入', error: req.flash('error') });
});

// signin
router.post('/admin/signin', (req, res) => {
  const account = {
    email: req.body.email,
    password: req.body.password,
  };
  firebaseAuth.signInWithEmailAndPassword(account.email, account.password)
    .then((response) => {
      req.session.uid = response.user.uid;
      res.redirect('/dashboard/index');
    })
    .catch((error) => {
      console.log(`error ${error.message}`);
      const errorMessage = error.message;
      req.flash('error', errorMessage);
      res.redirect('/auth/');
    });
});

// signout
router.post('/logout', (req, res) => {
  req.session.uid = '';
  res.redirect('/auth/signin');
});

module.exports = router;
