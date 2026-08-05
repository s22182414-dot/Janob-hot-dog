import classic from "@/assets/item-classic.jpg";
import cheese from "@/assets/item-cheese.jpg";
import fries from "@/assets/item-fries.jpg";
import drink from "@/assets/item-drink.jpg";
import lavash from "@/assets/item-lavash.jpg";
import hero from "@/assets/hero-hotdog.jpg";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "Hot-Doglar" | "Gazaklar" | "Ichimliklar";
  tag?: string;
};

export const menu: MenuItem[] = [
  {
    id: "janob-special",
    name: "Janob Special",
    description: "Olovda pishirilgan mol go'shtli sosiska, tuzlangan piyoz, chakka sousi, ko'katlar, brioche non.",
    price: 42000,
    image: hero,
    category: "Hot-Doglar",
    tag: "Oshpaz tanlovi",
  },
  {
    id: "classic",
    name: "Klassik Hot-Dog",
    description: "Shirali sosiska, shirin gorchitsa va qarsildoq qovurilgan piyoz.",
    price: 28000,
    image: classic,
    category: "Hot-Doglar",
  },
  {
    id: "cheese-fire",
    name: "Olovli Cheese",
    description: "Eritilgan chedder pishloq, xalapeno va dudlangan paprikali ketchup.",
    price: 35000,
    image: cheese,
    category: "Hot-Doglar",
    tag: "Achchiq",
  },
  {
    id: "lavash-dog",
    name: "Lavash Dog",
    description: "Tandir lavash, grilda pishgan sosiska, pomidor, ko'katlar, sarimsoqli sous.",
    price: 33000,
    image: lavash,
    category: "Hot-Doglar",
  },
  {
    id: "fries",
    name: "Olovli Kartoshka Fri",
    description: "Qo'lda to'g'ralgan kartoshka fri, sumalak tuzi va uy sousi.",
    price: 18000,
    image: fries,
    category: "Gazaklar",
  },
  {
    id: "limonad",
    name: "Yalpizli Limonad",
    description: "Yangi siqilgan limon, yalpiz va muzli gazli suv.",
    price: 15000,
    image: drink,
    category: "Ichimliklar",
  },
];

export const categories = ["Barchasi", "Hot-Doglar", "Gazaklar", "Ichimliklar"] as const;

export const formatSom = (value: number) => `${value.toLocaleString("en-US")} so'm`;
