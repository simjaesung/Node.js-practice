const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;
const url =
  'mongodb+srv://admin:qwer1234@simsorry.gs3mckv.mongodb.net/?retryWrites=true&w=majority&appName=simsorry';
new MongoClient(url)
  .connect()
  .then(client => {
    console.log('DB Connect');
    db = client.db('forum');
    app.listen(8080, () => {
      console.log('http://localhost:8080 에서 서버 실행중');
    });
  })
  .catch(err => {
    console.log(err);
  });

app.get('/', (req, res) => {
  let time = new Date();
  res.render('time.ejs', { time: time });
});

app.get('/news', (요청, 응답) => {
  응답.send('흐림');
});

app.get('/shop', (요청, 응답) => {
  응답.send('쇼핑 페이지');
});

app.get('/about', (요청, 응답) => {
  응답.sendFile(__dirname + '/jaesung.html');
});

app.get('/list', async (req, res) => {
  let result = await db.collection('post').find().toArray();
  res.render('list.ejs', { postlist: result });
});

app.get('/time', (req, res) => {
  let time = new Date();
  res.render('time.ejs', { time: time });
});

app.get('/write', (req, res) => {
  res.render('write.ejs');
});

//게시글 작성 코드
app.post('/add', async (req, res) => {
  console.log(req.body);
  try {
    if (req.body.title == '' || req.body.content == '') {
      res.send("<script>alert('내용을 채워주세요!'); history.back();</script>");
    } else {
      await db
        .collection('post')
        .insertOne(
          { title: req.body.title, content: req.body.content },
          function (err, result) {
            console.log('저장완료!');
          }
        );
      res.redirect('/list');
    }
  } catch (e) {
    res.status(500).send('server error');
    console.log(e);
  }
});

//상세페이지 게시글 보여주기
app.get('/detail/:id', async (req, res) => {
  try {
    let result = await db
      .collection('post')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (result == null) {
      res.status(404).send('잘못된 요청');
    } else res.render('detail.ejs', { data: result });
  } catch (e) {
    console.log(e); //글자길이가 다르면 에러가 뜸
    res.send("<script>alert('잘못된 접근입니다.'); history.back();</script>");
  }
});

//게시글 수정부분
app.get('/edit/:id', async (req, res) => {
  try {
    let result = await db
      .collection('post')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (result == null) {
      res.status(404).send('잘못된 요청');
    } else {
      console.log(result);
      res.render('edit.ejs', { data: result });
    }
  } catch (e) {
    console.log(e); //글자길이가 다르면 에러가 뜸
    res.send("<script>alert('잘못된 접근입니다.'); history.back();</script>");
  }
});

app.post('/edit/:id', async (req, res) => {
  try {
    if (req.body.title == '' || req.body.content == '') {
      res.send("<script>alert('내용을 채워주세요!'); history.back();</script>");
    } else {
      let result = await db
        .collection('post')
        .updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { title: req.body.title, content: req.body.content } }
        );
      res.redirect(`/detail/${req.params.id}`);
    }
  } catch (e) {
    console.log(e); //글자길이가 다르면 에러가 뜸
    res.send("<script>alert('잘못된 접근입니다.'); history.back();</script>");
  }
});

app.delete('/delete/:id', async (req, res) => {
  console.log(req.params);
  let result = await db
    .collection('post')
    .deleteOne({ _id: new ObjectId(req.params.id) });
  res.send('삭제완료');
});
