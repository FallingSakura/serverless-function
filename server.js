require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
const app = express()
const uri = process.env.MONGODB_URI
const port = 5000
const dataPath = path.join(__dirname, './src/calendar.json')
const client = new MongoClient(uri)

let database, collection

async function connectToDatabase() {
  try {
    await client.connect()
    console.log('Connected to MongoDB Atlas!')
    database = client.db('calendar')
    collection = database.collection('fallingsakura')
  } catch (err) {
    console.error(err)
  }

  app.use(cors())
  app.use(express.json()) // 中间件，将 JSON 请求体转换为对象
  app.put('/update-data/:id', async (req, res) => {
    const id = req.params.id
    const { date, value } = req.body
    try {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { [`data.${date}`]: value } }
      )
    } catch (err) {
      console.error(err)
    }
    res.send('Update-data Success')
  })
  app.get('/get-data/:id', async (req, res) => {
    const id = req.params.id
    const document = await collection.findOne({ _id: new ObjectId(id) })
    await clearData(document, id)
    res.json(document.data)
  })
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at https://localhost:${port}`)
  })
}

connectToDatabase().catch(console.error)

async function clearData(document, id) {
  if (!document || !document.data) {
    console.log("Document or 'data' field not found.")
    return
  }
  const keysToUnset = {}
  for (const key in document.data) {
    if (document.data[key] === null) {
      keysToUnset[`data.${key}`] = ''
    }
  }
  if (Object.keys(keysToUnset).length === 0) return
  await collection.updateOne({ _id: new ObjectId(id) }, { $unset: keysToUnset })
}
