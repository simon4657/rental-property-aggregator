import { drizzle } from "drizzle-orm/mysql2";
import { properties } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const sampleProperties = [
  {
    propertyUrl: "https://rent.591.com.tw/home/123456",
    address: "台北市大安區復興南路一段100號",
    city: "台北市",
    district: "大安區",
    floor: "5/12",
    price: 28000,
    rooms: "2房1廳1衛",
    age: 15,
    hasElevator: true,
    nearMrt: "捷運大安站",
    source: "591租屋網",
    notes: "近捷運站，生活機能佳",
  },
  {
    propertyUrl: "https://rent.591.com.tw/home/123457",
    address: "台北市中山區南京東路三段200號",
    city: "台北市",
    district: "中山區",
    floor: "3/8",
    price: 25000,
    rooms: "1房1廳1衛",
    age: 20,
    hasElevator: true,
    nearMrt: "捷運南京復興站",
    source: "591租屋網",
    notes: "採光良好，近商圈",
  },
  {
    propertyUrl: "https://www.sinyi.com.tw/rent/12345",
    address: "新北市板橋區文化路一段50號",
    city: "新北市",
    district: "板橋區",
    floor: "7/15",
    price: 22000,
    rooms: "3房2廳1衛",
    age: 10,
    hasElevator: true,
    nearMrt: "捷運板橋站",
    source: "信義房屋",
    notes: "近火車站，交通便利",
  },
  {
    propertyUrl: "https://www.yungching.com.tw/rent/67890",
    address: "台北市信義區松仁路100號",
    city: "台北市",
    district: "信義區",
    floor: "10/20",
    price: 35000,
    rooms: "2房2廳1衛",
    age: 8,
    hasElevator: true,
    nearMrt: "捷運市政府站",
    source: "永慶房仲",
    notes: "豪華裝潢，景觀佳",
  },
  {
    propertyUrl: "https://rent.591.com.tw/home/123458",
    address: "台北市士林區中正路300號",
    city: "台北市",
    district: "士林區",
    floor: "2/5",
    price: 18000,
    rooms: "2房1廳1衛",
    age: 25,
    hasElevator: false,
    nearMrt: "捷運士林站",
    source: "591租屋網",
    notes: "近夜市，生活便利",
  },
  {
    propertyUrl: "https://rent.591.com.tw/home/123459",
    address: "新北市新店區北新路三段150號",
    city: "新北市",
    district: "新店區",
    floor: "8/12",
    price: 20000,
    rooms: "2房1廳1衛",
    age: 12,
    hasElevator: true,
    nearMrt: "捷運新店站",
    source: "591租屋網",
    notes: "環境清幽，適合家庭",
  },
  {
    propertyUrl: "https://www.sinyi.com.tw/rent/12346",
    address: "台北市內湖區成功路四段200號",
    city: "台北市",
    district: "內湖區",
    floor: "6/10",
    price: 26000,
    rooms: "2房2廳1衛",
    age: 10,
    hasElevator: true,
    nearMrt: "捷運內湖站",
    source: "信義房屋",
    notes: "近科技園區，適合上班族",
  },
  {
    propertyUrl: "https://rent.591.com.tw/home/123460",
    address: "台北市文山區木柵路一段100號",
    city: "台北市",
    district: "文山區",
    floor: "4/8",
    price: 19000,
    rooms: "1房1廳1衛",
    age: 18,
    hasElevator: true,
    nearMrt: "捷運木柵站",
    source: "591租屋網",
    notes: "學區附近，安靜舒適",
  },
  {
    propertyUrl: "https://www.yungching.com.tw/rent/67891",
    address: "新北市中和區中山路二段300號",
    city: "新北市",
    district: "中和區",
    floor: "5/12",
    price: 21000,
    rooms: "3房1廳1衛",
    age: 15,
    hasElevator: true,
    nearMrt: "捷運永安市場站",
    source: "永慶房仲",
    notes: "近市場，採買方便",
  },
  {
    propertyUrl: "https://rent.591.com.tw/home/123461",
    address: "台北市松山區八德路四段500號",
    city: "台北市",
    district: "松山區",
    floor: "9/15",
    price: 30000,
    rooms: "2房2廳2衛",
    age: 7,
    hasElevator: true,
    nearMrt: "捷運松山站",
    source: "591租屋網",
    notes: "新大樓，設備完善",
  },
];

async function seed() {
  console.log("開始新增測試資料...");
  
  for (const property of sampleProperties) {
    await db.insert(properties).values(property);
    console.log(`✓ 已新增: ${property.address}`);
  }
  
  console.log(`\n成功新增 ${sampleProperties.length} 筆測試資料！`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("新增資料時發生錯誤:", error);
  process.exit(1);
});

