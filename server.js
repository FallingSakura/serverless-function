const fs = require('fs')
const express = require('express')
const app = express()
const port = 3000
const path = require('path')
// const DIR =
//   '/home/fallingsakura/CodeProgram/Front-End/Apps/Portfolio/FallingWeb/src/'
// const dataPath = path.join(DIR, './data/calendar.json')
const dataPath = './src/calendar.json'
const cors = require('cors')

app.use(cors())
app.use(express.json()) // 中间件，将 JSON 请求体转换为对象
app.post('/update-data', (req, res) => {
  const newData = req.body
  fs.readFile(dataPath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading data file.')
    }
    let jsonData = { ...JSON.parse(data), ...newData }
    fs.writeFile(
      dataPath,
      JSON.stringify(jsonData, null, 2),
      'utf-8',
      (err) => err
    )
  })
  res.send('Success')
})
app.get('/', (req, res) => {
  res.send('Hello World')
})
app.get('/get-data', (req, res) => {
  fs.readFile(dataPath, 'utf-8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error reading data file.')
    }
    res.json(JSON.parse(data))
    // json -> Object -> json -> String
  })
})
app.listen(port, '0.0.0.0', () => {
  // 每次启动时清空 null 数据
  fs.readFile(dataPath, 'utf-8', (err, data) => {
    const newData = JSON.parse(data)
    const clearData = Object.keys(newData).reduce((acc, key) => {
      if (newData[key] !== null) {
        acc[key] = newData[key]
      }
      return acc
    }, {})
    fs.writeFile(
      dataPath,
      JSON.stringify(clearData, null, 2),
      'utf-8',
      (err) => err
    )
  })
  console.log(`Server running at https://localhost:${port}`)
})
