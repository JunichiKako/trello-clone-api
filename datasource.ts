import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type:'sqlite',
  database:'trello-clone.sqlite',
  synchronize:true,
  logging:false,
  entities:[],
  migrations:[],
  subscribers:[]
})