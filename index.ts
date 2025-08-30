import express from "express";
import cors from 'cors';
import { db, lists, cards } from "./src/db/index.js";
import { desc, eq, asc, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";

const app = express();
const PORT = 8888;

// JSONリクエストボディのパース
app.use(express.json());
// CORS設定（localhost:5173からのアクセスを許可）
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Lists API
app.post('/lists', async (req, res) => {
  try {
    const { title } = req.body;

    const maxPositionListArray = await db.select()
      .from(lists)
      .orderBy(desc(lists.position))
      .limit(1);

    const maxPositionList = maxPositionListArray[0];
    const nextPosition = maxPositionList != null ? maxPositionList.position + 1 : 0;

    const [list] = await db.insert(lists)
      .values({ title, position: nextPosition })
      .returning();

    res.status(201).json(list);
  } catch (error) {
    console.error('リスト作成エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

app.get('/lists', async (req, res) => {
  try {
    const allLists = await db.select()
      .from(lists)
      .orderBy(asc(lists.position));
    
    res.status(200).json(allLists);
  } catch (error) {
    console.error('リスト取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

app.delete('/lists/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingList = await db.select()
      .from(lists)
      .where(eq(lists.id, id))
      .limit(1);

    if (existingList.length === 0) {
      res.status(404).json({ message: 'リストが見つかりません' });
      return;
    }

    await db.delete(lists).where(eq(lists.id, id));

    res.status(200).json({ message: 'リストを削除しました' });
  } catch (error) {
    console.error('リスト削除エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

app.put('/lists', async (req, res) => {
  try {
    const { lists: listData } = req.body;
    const listArray = Array.isArray(listData) ? listData : [listData];

    // トランザクション内で一括更新
    const updatedLists = await db.transaction(async (tx) => {
      const results = [];
      
      for (const list of listArray) {
        const [updated] = await tx.update(lists)
          .set({ 
            title: list.title, 
            position: list.position,
            updatedAt: sql`(unixepoch())`
          })
          .where(eq(lists.id, list.id))
          .returning();
        results.push(updated);
      }
      
      return results;
    });

    res.status(200).json(updatedLists);
  } catch (error) {
    console.error('リスト更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// Cards API
app.post('/cards', async (req, res) => {
  try {
    const { title, listId } = req.body;

    const maxPositionCardArray = await db.select()
      .from(cards)
      .where(eq(cards.listId, listId))
      .orderBy(desc(cards.position))
      .limit(1);

    const maxPositionCard = maxPositionCardArray[0];
    const nextPosition = maxPositionCard != null ? maxPositionCard.position + 1 : 0;

    const [card] = await db.insert(cards)
      .values({ title, listId, position: nextPosition })
      .returning();

    res.status(201).json(card);
  } catch (error) {
    console.error('カード作成エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

app.get('/cards', async (req, res) => {
  try {
    const allCards = await db.select()
      .from(cards)
      .orderBy(asc(cards.position));

    res.status(200).json(allCards);
  } catch (error) {
    console.error('カード取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

app.delete('/cards/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingCard = await db.select()
      .from(cards)
      .where(eq(cards.id, id))
      .limit(1);

    if (existingCard.length === 0) {
      res.status(404).json({ message: 'カードが見つかりません' });
      return;
    }

    await db.delete(cards).where(eq(cards.id, id));
    
    res.status(200).json({ message: 'カードを削除しました' });
  } catch (error) {
    console.error('カード削除エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

app.put('/cards', async (req, res) => {
  try {
    const { cards: cardData } = req.body;
    const cardArray = Array.isArray(cardData) ? cardData : [cardData];

    // トランザクション内で一括更新
    const updatedCards = await db.transaction(async (tx) => {
      const results = [];
      
      for (const card of cardArray) {
        const [updated] = await tx.update(cards)
          .set({ 
            title: card.title,
            description: card.description,
            position: card.position,
            listId: card.listId,
            completed: card.completed,
            dueDate: card.dueDate,
            updatedAt: sql`(unixepoch())`
          })
          .where(eq(cards.id, card.id))
          .returning();
        results.push(updated);
      }
      
      return results;
    });

    res.status(200).json(updatedCards);
  } catch (error) {
    console.error('カード更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 特定のリストのカードを取得
app.get("/lists/:id/cards", async (req, res) => {
  try {
    const listId = parseInt(req.params.id);
    const listCards = await db.select()
      .from(cards)
      .where(eq(cards.listId, listId))
      .orderBy(asc(cards.position));
    res.json(listCards);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});