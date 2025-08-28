import express from "express"
import { AppDataSource } from "./datasource.js"

const app = express()
const PORT = 8888

app.get("/",(req,res) => {
  res.send('Hello world')
})

AppDataSource.initialize().then(() => {
  console.log('データベースへ接続しました')
  app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`)
})
}) 



