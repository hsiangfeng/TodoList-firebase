const express = require('express');
const momont = require('moment');
const firebaseAdminDb = require('../connection/firebase_admin');


const categoryRef = firebaseAdminDb.ref('/category/');
const todolistRef = firebaseAdminDb.ref('/todolist/');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('dashboard/index', { title: '登入' });
});

// todolist
router.get('/created', (req, res) => {
  categoryRef.orderByChild('upDateTime').once('value')
    .then((snapshot) => {
      const category = [];
      snapshot.forEach((item) => {
        category.push(item.val());
      });
      category.reverse();
      res.render('dashboard/created', {
        title: '新增代辦事項',
        category,
      });
    });
});

router.post('/created', (req, res) => {
  const todolistData = req.body;
  const todolistPush = todolistRef.push();
  const upDateTime = Math.floor(Date.now() / 1000);
  todolistData.upDateTime = upDateTime;
  upDateTime.id = todolistPush.key;
  todolistRef.orderByChild('title').equalTo(todolistData.title).once('value')
    .then((snapshot) => {
      if (snapshot.val() !== null) {
        req.flash('info', '已存在相同代辦事項名稱。');
        res.redirect('/dashboard/created');
      } else {
        todolistPush.set(todolistData).then(() => {
          req.flash('success', '代辦事項新增成功。');
          res.redirect('/dashboard/created');
        });
      }
    })
    .catch((error) => {
      req.flash('info', `出現錯誤:${error}`);
    });
});

// category
router.get('/category', (req, res) => {
  const messages = req.flash('info');
  const success = req.flash('success');
  categoryRef.orderByChild('upDateTime').once('value')
    .then((snapshot) => {
      const category = [];
      snapshot.forEach((snapshotChild) => {
        category.push(snapshotChild.val());
      });
      category.reverse();
      res.render('dashboard/category', {
        title: '分類管理',
        messages,
        hasInfo: messages.length > 0,
        hasSiccess: success.length > 0,
        success,
        category,
        momont,
      });
    })
    .catch((error) => {
      req.flash('info', error);
    });
});

router.post('/category/created', (req, res) => {
  const categoryData = req.body;
  const categoryPush = categoryRef.push();
  const upDateTime = Math.floor(Date.now() / 1000);
  categoryData.upDateTime = upDateTime;
  categoryData.id = categoryPush.key;
  categoryRef.orderByChild('title').equalTo(categoryData.title).once('value')
    .then((snapshot) => {
      if (snapshot.val() !== null) {
        req.flash('info', '已存在相同分類名稱。');
        res.redirect('/dashboard/category');
      } else {
        categoryPush.set(categoryData).then(() => {
          req.flash('success', '分類新增成功。');
          res.redirect('/dashboard/category');
        });
      }
    })
    .catch((error) => {
      req.flash('info', `出現錯誤:${error}`);
    });
});

router.put('/category/edit/:id', (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const upDateTime = Math.floor(Date.now() / 1000);
  data.upDateTime = upDateTime;
  categoryRef.child(id).update(data)
    .then(() => {
      req.flash('success', '編輯成功');
      res.send({
        message: '文章刪除',
        url: '/dashboard/category',
      });
      res.end();
    });
});

router.delete('/category/delete/:id', (req, res) => {
  const { id } = req.params;
  categoryRef.child(id).remove();
  req.flash('info', '文章已刪除');
  res.send({
    message: '文章刪除',
    url: '/dashboard/category',
  });
  res.end();
});

module.exports = router;
