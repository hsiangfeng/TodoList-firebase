const express = require('express');
const momont = require('moment');
const firebaseAdminDb = require('../connection/firebase_admin');


const categoryRef = firebaseAdminDb.ref('/category/');
const todolistRef = firebaseAdminDb.ref('/todolist/');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const { status } = req.query || 'all';
  todolistRef.orderByChild('upDateTime').once('value')
    .then((snapshot) => {
      const todolist = [];
      snapshot.forEach((item) => {
        if (status === 'all') {
          todolist.push(item.val());
        } else if (item.val().status === status) {
          todolist.push(item.val());
        }
      });
      res.render('dashboard/index', {
        title: '登入',
        todolist,
      });
    });
});

// todolist
router.get('/todolist/', (req, res) => {
  const success = req.flash('success');
  const info = req.flash('info');
  categoryRef.orderByChild('upDateTime').once('value')
    .then((snapshot) => {
      const category = [];
      snapshot.forEach((item) => {
        category.push(item.val());
      });
      category.reverse();
      res.render('dashboard/todolist', {
        title: '新增代辦事項',
        category,
        hasSuccess: success.length > 0,
        hasInfo: info.length > 0,
        success,
        action_url: '/dashboard/todolist/created',
        todolist: '',
        info,
      });
    });
});

router.post('/todolist/created', (req, res) => {
  const todolistData = req.body;
  const todolistPush = todolistRef.push();
  const upDateTime = Math.floor(Date.now() / 1000);
  todolistData.upDateTime = upDateTime;
  todolistData.id = todolistPush.key;
  todolistData.status = req.body.status || 'off';
  todolistRef.orderByChild('title').equalTo(todolistData.title).once('value')
    .then((snapshot) => {
      if (snapshot.val() !== null) {
        req.flash('info', '已存在相同代辦事項名稱。');
        res.redirect('/dashboard/todolist');
      } else {
        todolistPush.set(todolistData).then(() => {
          req.flash('success', '代辦事項新增成功。');
          res.redirect('/dashboard/todolist');
        });
      }
    })
    .catch((error) => {
      req.flash('info', `出現錯誤:${error}`);
    });
});

router.get('/todolist/:id', (req, res) => {
  const { id } = req.params;
  const success = req.flash('success');
  const category = [];
  categoryRef.orderByChild('upDateTime').once('value')
    .then((snapshot) => {
      snapshot.forEach((snapshotChild) => {
        category.push(snapshotChild.val());
      });
      category.reverse();
      return todolistRef.child(id).once('value');
    })
    .then((snapshot) => {
      const todolist = snapshot.val();
      res.render('dashboard/todolist', {
        title: '編輯代辦事項',
        category,
        action_url: `/dashboard/todolist/edit/${id}`,
        hasSuccess: success.length > 0,
        success,
        todolist,
        momont,
      });
    });
});

router.post('/todolist/edit/:id', (req, res) => {
  const { id } = req.params;
  const todolistData = req.body;
  const upDateTime = Math.floor(Date.now() / 1000);
  todolistData.upDateTime = upDateTime;
  todolistRef.child(id).update(todolistData)
    .then(() => {
      req.flash('success', '編輯成功');
      res.redirect(`/dashboard/todolist/${id}`);
    });
});

router.delete('/todolist/delete/:id', (req, res) => {
  const { id } = req.params;
  todolistRef.child(id).remove();
  res.send({
    message: '刪除成功',
    url: '/dashboard/',
  });
  res.end();
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
        message: '編輯成功',
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
