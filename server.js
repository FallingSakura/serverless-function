require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
const { connect } = require('mongoose')
const app = express()
const uri = process.env.MONGODB_URI
const port = 5000
const User = require('./src/modules/User')

let client
async function connectToDatabase() {
  let database, collection
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
    database = client.db('calendar')
    collection = database.collection('fallingsakura')
    console.log('Connected to MongoDB Atlas!')
  }
  return collection
}

app.use(cors())
app.use(express.json()) // 中间件，将 JSON 请求体转换为对象
app.put('/update-data', authenticateToken, async (req, res) => {
  const collection = await connectToDatabase()
  const id = req.id
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
app.get('/get-data', authenticateToken, async (req, res) => {
  const collection = await connectToDatabase()
  const id = req.id
  const document = await collection.findOne({ _id: new ObjectId(id) })
  clearData(document, id)
  res.json(document.data)
})
app.post('/login', async (req, res) => {
  const collection = await connectToDatabase()
  const { email, password } = req.body
  try {
    if (!email) return res.status(400).json({ message: 'No Email.' })
    const user = await collection.findOne({ email: email })
    if (!user) {
      return res.status(400).json({ message: 'User not found.' })
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password)
    // const isPasswordValid = password === user.password
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password Error.' })
    }
    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    )
    res.json({ token })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
app.post('/register', async (req, res) => {
  const collection = await connectToDatabase()
  const { name, email, password } = req.body
  try {
    let user = await collection.findOne({ email: email })
    if (user) {
      return res.status(400).json({ message: 'User has existed' })
    }
    user = new User({
      name,
      email,
      password
    })
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    await user.save()
    res.status(201).json({ msg: 'Register Successfully!', userId: user._id })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`)
})

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

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No Token.' })

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token Invalid.' })
    req.id = user.id
    next()
  })
}
