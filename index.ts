import express from "express"

const app = express()
const PORT = 8888

app.get("/",(req,res) => {
  res.send('Hello world')
})


app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`)
})