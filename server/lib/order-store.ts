import { promises as fs } from "node:fs";
import { join } from "node:path";

export type SavedOrder = {
  id: string;
  name: string;
  phone: string;
  mode: "delivery" | "pickup";
  address?: string;
  lines: { name: string; qty: number; price: number }[];
  total: number;
  createdAt: number;
  tg?: string;
};

const KV_URL = process.env["KV_REST_API_URL"] ?? "";
const KV_TOKEN = process.env["KV_REST_API_TOKEN"] ?? "";
const KV_KEY = "janob_orders";
const useKV = !!(KV_URL && KV_TOKEN);

const DATA_DIR = join(process.cwd(), ".data");
const FILE = join(DATA_DIR, "orders.json");

async function fileRead(): Promise<SavedOrder[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as SavedOrder[];
  } catch {
    return [];
  }
}

async function fileWrite(orders: SavedOrder[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(orders, null, 2), "utf-8");
}

async function kvRead(): Promise<SavedOrder[]> {
  const res = await fetch(`${KV_URL}/get/${KV_KEY}`, {
    headers: { authorization: `Bearer ${KV_TOKEN}` },
  });
  if (!res.ok) throw new Error(`KV get: ${res.status}`);
  const data = (await res.json()) as { result?: string | null };
  if (!data.result) return [];
  return JSON.parse(data.result) as SavedOrder[];
}

async function kvWrite(orders: SavedOrder[]) {
  const res = await fetch(`${KV_URL}/set/${KV_KEY}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${KV_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(JSON.stringify(orders)),
  });
  if (!res.ok) throw new Error(`KV set: ${res.status}`);
}

async function readOrders(): Promise<SavedOrder[]> {
  try {
    if (useKV) return await kvRead();
  } catch (error) {
    console.error("KV o'qish xatosi, faylga tushamiz:", error);
  }
  return fileRead();
}

async function writeOrders(orders: SavedOrder[]) {
  if (useKV) {
    try {
      await kvWrite(orders);
      return;
    } catch (error) {
      console.error("KV yozish xatosi, faylga tushamiz:", error);
    }
  }
  await fileWrite(orders);
}

export async function getOrders(): Promise<SavedOrder[]> {
  const orders = await readOrders();
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addOrder(order: SavedOrder): Promise<void> {
  const orders = await readOrders();
  if (orders.some((o) => o.id === order.id)) return; // takroriy yuborishdan saqlaymiz
  orders.push(order);
  await writeOrders(orders);
}
