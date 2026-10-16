import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { sql } from "drizzle-orm";

import { db, eq } from "./db";

import {
  categories,
  cities,
  productCategories,
  productLikes,
  productSaves,
  productSpecs,
  productViews,
  products,
  roles,
  sellerProducts,
  sellerProfiles,
  sellerTypes,
  userProfiles,
  userRoles,
  users,
} from "./schema";

type SeedProduct = {
  name: string;
  description: string;
  basePrice: number;
  categories: string[];
  specs: Array<{
    key: string;
    value: string;
  }>;
};

function getItem<T>(items: readonly T[], index: number): T {
  const item = items[index];

  if (!item) {
    throw new Error(`Seed item not found at index ${index}`);
  }

  return item;
}

const productSeedData: SeedProduct[] = [
  {
    name: "گوشی اپل آیفون ۱۵ پرو (Apple iPhone 15 Pro)",
    description:
      "گوشی اپل آیفون ۱۵ پرو (Apple iPhone 15 Pro) با بدنه تیتانیومی، دوربین حرفه‌ای و پردازنده قدرتمند مناسب استفاده روزمره و حرفه‌ای.",
    basePrice: 82_000_000,
    categories: ["کالای دیجیتال", "موبایل", "اپل"],
    specs: [
      { key: "Storage", value: "256 GB" },
      { key: "RAM", value: "8 GB" },
      { key: "Display", value: "6.1 inch OLED" },
      { key: "Network", value: "5G" },
    ],
  },
  {
    name: "گوشی سامسونگ گلکسی S24 (Samsung Galaxy S24)",
    description:
      "گوشی سامسونگ گلکسی S24 (Samsung Galaxy S24) با نمایشگر AMOLED، دوربین باکیفیت و سخت‌افزار مناسب استفاده حرفه‌ای.",
    basePrice: 55_000_000,
    categories: ["کالای دیجیتال", "موبایل", "سامسونگ"],
    specs: [
      { key: "Storage", value: "256 GB" },
      { key: "RAM", value: "8 GB" },
      { key: "Display", value: "6.2 inch AMOLED" },
      { key: "Network", value: "5G" },
    ],
  },
  {
    name: "گوشی گوگل پیکسل ۹ (Google Pixel 9)",
    description:
      "گوشی گوگل پیکسل ۹ (Google Pixel 9) با اندروید خالص، دوربین قدرتمند و قابلیت‌های هوشمند پردازش تصویر.",
    basePrice: 58_000_000,
    categories: ["کالای دیجیتال", "موبایل"],
    specs: [
      { key: "Storage", value: "128 GB" },
      { key: "RAM", value: "12 GB" },
      { key: "Display", value: "6.3 inch OLED" },
    ],
  },
  {
    name: "گوشی شیائومی ۱۴ (Xiaomi 14)",
    description:
      "گوشی شیائومی ۱۴ (Xiaomi 14) با سخت‌افزار پرقدرت، نمایشگر باکیفیت و دوربین مناسب عکاسی روزمره و حرفه‌ای.",
    basePrice: 48_000_000,
    categories: ["کالای دیجیتال", "موبایل"],
    specs: [
      { key: "Storage", value: "256 GB" },
      { key: "RAM", value: "12 GB" },
      { key: "Display", value: "6.36 inch AMOLED" },
    ],
  },
  {
    name: "لپ‌تاپ اپل مک‌بوک ایر M3 (Apple MacBook Air M3)",
    description:
      "لپ‌تاپ اپل مک‌بوک ایر M3 (Apple MacBook Air M3) سبک و کم‌مصرف با عملکرد مناسب برنامه‌نویسی، طراحی و استفاده روزمره.",
    basePrice: 95_000_000,
    categories: ["کالای دیجیتال", "لپ‌تاپ", "اپل"],
    specs: [
      { key: "Chip", value: "Apple M3" },
      { key: "RAM", value: "16 GB" },
      { key: "Storage", value: "512 GB SSD" },
      { key: "Display", value: "13.6 inch" },
    ],
  },
  {
    name: "لپ‌تاپ ایسوس راگ زفیروس G14 (ASUS ROG Zephyrus G14)",
    description:
      "لپ‌تاپ ایسوس راگ زفیروس G14 (ASUS ROG Zephyrus G14) مناسب بازی و پردازش سنگین با کارت گرافیک قدرتمند.",
    basePrice: 145_000_000,
    categories: ["کالای دیجیتال", "لپ‌تاپ", "گیمینگ"],
    specs: [
      { key: "RAM", value: "32 GB" },
      { key: "Storage", value: "1 TB SSD" },
      { key: "GPU", value: "NVIDIA RTX 4070" },
      { key: "Display", value: "14 inch" },
    ],
  },
  {
    name: "لپ‌تاپ لنوو تینک‌پد X1 کربن (Lenovo ThinkPad X1 Carbon)",
    description:
      "لپ‌تاپ لنوو تینک‌پد X1 کربن (Lenovo ThinkPad X1 Carbon) مناسب محیط کاری، برنامه‌نویسی و استفاده حرفه‌ای.",
    basePrice: 110_000_000,
    categories: ["کالای دیجیتال", "لپ‌تاپ", "اداری"],
    specs: [
      { key: "RAM", value: "16 GB" },
      { key: "Storage", value: "512 GB SSD" },
      { key: "Display", value: "14 inch" },
    ],
  },
  {
    name: "تبلت اپل آیپد ایر M2 (Apple iPad Air M2)",
    description:
      "تبلت اپل آیپد ایر M2 (Apple iPad Air M2) مناسب مطالعه، طراحی، تماشای محتوا و کارهای روزمره.",
    basePrice: 52_000_000,
    categories: ["کالای دیجیتال", "تبلت", "اپل"],
    specs: [
      { key: "Chip", value: "Apple M2" },
      { key: "Storage", value: "128 GB" },
      { key: "Display", value: "11 inch" },
    ],
  },
  {
    name: "تبلت سامسونگ گلکسی تب S9 (Samsung Galaxy Tab S9)",
    description:
      "تبلت سامسونگ گلکسی تب S9 (Samsung Galaxy Tab S9) با نمایشگر AMOLED و سخت‌افزار مناسب کار و سرگرمی.",
    basePrice: 47_000_000,
    categories: ["کالای دیجیتال", "تبلت", "سامسونگ"],
    specs: [
      { key: "Storage", value: "256 GB" },
      { key: "RAM", value: "12 GB" },
      { key: "Display", value: "11 inch AMOLED" },
    ],
  },
  {
    name: "هدفون اپل ایرپاد پرو ۲ (Apple AirPods Pro 2)",
    description:
      "هدفون اپل ایرپاد پرو ۲ (Apple AirPods Pro 2) با حذف نویز فعال و کیفیت صدای مناسب تماس و موسیقی.",
    basePrice: 18_500_000,
    categories: ["کالای دیجیتال", "صوتی", "اپل"],
    specs: [
      { key: "Connection", value: "Bluetooth" },
      { key: "Noise Cancellation", value: "Active" },
      { key: "Charging", value: "USB-C" },
    ],
  },
  {
    name: "هدفون سونی WH-1000XM5 (Sony WH-1000XM5)",
    description:
      "هدفون سونی WH-1000XM5 (Sony WH-1000XM5) با حذف نویز حرفه‌ای و شارژدهی بالا برای موسیقی و سفر.",
    basePrice: 24_000_000,
    categories: ["کالای دیجیتال", "صوتی"],
    specs: [
      { key: "Connection", value: "Bluetooth 5.2" },
      { key: "Battery", value: "30 Hours" },
      { key: "Noise Cancellation", value: "Active" },
    ],
  },
  {
    name: "اسپیکر جی‌بی‌ال شارژ ۵ (JBL Charge 5)",
    description:
      "اسپیکر جی‌بی‌ال شارژ ۵ (JBL Charge 5) قابل حمل با صدای قدرتمند و مقاومت مناسب در برابر آب.",
    basePrice: 11_500_000,
    categories: ["کالای دیجیتال", "صوتی"],
    specs: [
      { key: "Battery", value: "20 Hours" },
      { key: "Water Resistance", value: "IP67" },
      { key: "Connection", value: "Bluetooth" },
    ],
  },
  {
    name: "ساعت اپل سری ۱۰ (Apple Watch Series 10)",
    description:
      "ساعت اپل سری ۱۰ (Apple Watch Series 10) مناسب پایش فعالیت‌های ورزشی، اعلان‌ها و استفاده روزمره.",
    basePrice: 34_000_000,
    categories: ["کالای دیجیتال", "ساعت هوشمند", "اپل"],
    specs: [
      { key: "Size", value: "46 mm" },
      { key: "Connection", value: "GPS" },
      { key: "Water Resistance", value: "50 m" },
    ],
  },
  {
    name: "ساعت سامسونگ گلکسی واچ ۷ (Samsung Galaxy Watch 7)",
    description:
      "ساعت سامسونگ گلکسی واچ ۷ (Samsung Galaxy Watch 7) مناسب کاربران اندروید با قابلیت پایش فعالیت و سلامت.",
    basePrice: 21_000_000,
    categories: ["کالای دیجیتال", "ساعت هوشمند", "سامسونگ"],
    specs: [
      { key: "Size", value: "44 mm" },
      { key: "Connection", value: "Bluetooth" },
      { key: "OS", value: "Wear OS" },
    ],
  },
  {
    name: "ساعت گارمین فوررانر ۲۶۵ (Garmin Forerunner 265)",
    description:
      "ساعت گارمین فوررانر ۲۶۵ (Garmin Forerunner 265) مناسب دویدن و تمرینات ورزشی با GPS دقیق.",
    basePrice: 31_000_000,
    categories: ["کالای دیجیتال", "ساعت هوشمند", "ورزش"],
    specs: [
      { key: "GPS", value: "Built-in" },
      { key: "Display", value: "AMOLED" },
      { key: "Water Resistance", value: "5 ATM" },
    ],
  },
  {
    name: "کنسول پلی‌استیشن ۵ اسلیم (Sony PlayStation 5 Slim)",
    description:
      "کنسول پلی‌استیشن ۵ اسلیم (Sony PlayStation 5 Slim) مناسب اجرای بازی‌های نسل جدید با کیفیت تصویر بالا.",
    basePrice: 39_000_000,
    categories: ["کالای دیجیتال", "گیمینگ"],
    specs: [
      { key: "Storage", value: "1 TB SSD" },
      { key: "Resolution", value: "Up to 4K" },
    ],
  },
  {
    name: "کنسول ایکس‌باکس سری X (Microsoft Xbox Series X)",
    description:
      "کنسول ایکس‌باکس سری X (Microsoft Xbox Series X) با سخت‌افزار قدرتمند و پشتیبانی از بازی‌های نسل جدید.",
    basePrice: 42_000_000,
    categories: ["کالای دیجیتال", "گیمینگ"],
    specs: [
      { key: "Storage", value: "1 TB SSD" },
      { key: "Resolution", value: "Up to 4K" },
    ],
  },
  {
    name: "کنسول نینتندو سوییچ اولد (Nintendo Switch OLED)",
    description:
      "کنسول نینتندو سوییچ اولد (Nintendo Switch OLED) قابل استفاده به‌صورت دستی و خانگی با نمایشگر باکیفیت.",
    basePrice: 25_000_000,
    categories: ["کالای دیجیتال", "گیمینگ"],
    specs: [
      { key: "Display", value: "7 inch OLED" },
      { key: "Storage", value: "64 GB" },
    ],
  },
  {
    name: "ماوس لاجیتک MX Master 3S (Logitech MX Master 3S)",
    description:
      "ماوس لاجیتک MX Master 3S (Logitech MX Master 3S) مناسب کار حرفه‌ای، طراحی و استفاده طولانی‌مدت.",
    basePrice: 8_900_000,
    categories: ["کالای دیجیتال", "لوازم جانبی", "اداری"],
    specs: [
      { key: "DPI", value: "8000" },
      { key: "Connection", value: "Bluetooth / USB" },
      { key: "Buttons", value: "7" },
    ],
  },
  {
    name: "کیبورد کیکرون K8 پرو (Keychron K8 Pro)",
    description:
      "کیبورد کیکرون K8 پرو (Keychron K8 Pro) مکانیکی و بی‌سیم، مناسب برنامه‌نویسی، تایپ و بازی.",
    basePrice: 9_500_000,
    categories: ["کالای دیجیتال", "لوازم جانبی", "گیمینگ"],
    specs: [
      { key: "Layout", value: "TKL" },
      { key: "Connection", value: "Bluetooth / USB-C" },
      { key: "Type", value: "Mechanical" },
    ],
  },
  {
    name: "اس‌اس‌دی سامسونگ ۹۹۰ پرو ۲ ترابایت (Samsung 990 Pro 2TB)",
    description:
      "اس‌اس‌دی سامسونگ ۹۹۰ پرو ۲ ترابایت (Samsung 990 Pro 2TB) مناسب سیستم‌های پرسرعت، بازی و پردازش حرفه‌ای.",
    basePrice: 14_500_000,
    categories: ["کالای دیجیتال", "ذخیره‌سازی"],
    specs: [
      { key: "Capacity", value: "2 TB" },
      { key: "Interface", value: "PCIe 4.0 NVMe" },
      { key: "Form Factor", value: "M.2 2280" },
    ],
  },
  {
    name: "اس‌اس‌دی اکسترنال سن‌دیسک اکستریم ۱ ترابایت (SanDisk Extreme Portable 1TB)",
    description:
      "اس‌اس‌دی اکسترنال سن‌دیسک اکستریم ۱ ترابایت (SanDisk Extreme Portable 1TB) کوچک و مناسب جابه‌جایی سریع اطلاعات.",
    basePrice: 9_800_000,
    categories: ["کالای دیجیتال", "ذخیره‌سازی"],
    specs: [
      { key: "Capacity", value: "1 TB" },
      { key: "Interface", value: "USB-C" },
      { key: "Type", value: "Portable SSD" },
    ],
  },
  {
    name: "دوربین کانن EOS R50 (Canon EOS R50)",
    description:
      "دوربین کانن EOS R50 (Canon EOS R50) بدون آینه و مناسب عکاسی، فیلم‌برداری و تولید محتوای حرفه‌ای.",
    basePrice: 58_000_000,
    categories: ["کالای دیجیتال", "عکاسی و فیلم‌برداری"],
    specs: [
      { key: "Sensor", value: "24.2 MP APS-C" },
      { key: "Video", value: "4K" },
      { key: "Mount", value: "RF" },
    ],
  },
  {
    name: "دوربین سونی ZV-E10 (Sony ZV-E10)",
    description:
      "دوربین سونی ZV-E10 (Sony ZV-E10) مناسب ولاگ، استریم و تولید محتوا با امکان تعویض لنز.",
    basePrice: 54_000_000,
    categories: ["کالای دیجیتال", "عکاسی و فیلم‌برداری"],
    specs: [
      { key: "Sensor", value: "24.2 MP APS-C" },
      { key: "Video", value: "4K" },
      { key: "Mount", value: "Sony E" },
    ],
  },
  {
    name: "دوربین جیبی دی‌جی‌آی اوسمو پاکت ۳ (DJI Osmo Pocket 3)",
    description:
      "دوربین جیبی دی‌جی‌آی اوسمو پاکت ۳ (DJI Osmo Pocket 3) با گیمبال داخلی مناسب ولاگ و فیلم‌برداری روان.",
    basePrice: 44_000_000,
    categories: ["کالای دیجیتال", "عکاسی و فیلم‌برداری"],
    specs: [
      { key: "Video", value: "4K 120fps" },
      { key: "Stabilization", value: "3-Axis Gimbal" },
      { key: "Display", value: "2 inch" },
    ],
  },
  {
    name: "سرخ‌کن بدون روغن فیلیپس (Philips Air Fryer)",
    description:
      "سرخ‌کن بدون روغن فیلیپس (Philips Air Fryer) مناسب پخت غذا با مصرف کمتر روغن و تنظیم ساده دما.",
    basePrice: 12_000_000,
    categories: ["خانه و آشپزخانه", "لوازم آشپزخانه"],
    specs: [
      { key: "Capacity", value: "6.2 L" },
      { key: "Power", value: "2000 W" },
      { key: "Temperature", value: "Up to 200°C" },
    ],
  },
  {
    name: "اسپرسوساز دلونگی (DeLonghi Espresso Machine)",
    description:
      "اسپرسوساز دلونگی (DeLonghi Espresso Machine) مناسب تهیه اسپرسو و نوشیدنی‌های بر پایه قهوه در منزل.",
    basePrice: 26_000_000,
    categories: ["خانه و آشپزخانه", "لوازم آشپزخانه"],
    specs: [
      { key: "Pressure", value: "15 Bar" },
      { key: "Power", value: "1450 W" },
      { key: "Water Tank", value: "1.1 L" },
    ],
  },
  {
    name: "گوشت‌کوب برقی بوش (Bosch Hand Blender)",
    description:
      "گوشت‌کوب برقی بوش (Bosch Hand Blender) مناسب خردکردن، مخلوط‌کردن و آماده‌سازی مواد غذایی.",
    basePrice: 6_500_000,
    categories: ["خانه و آشپزخانه", "لوازم آشپزخانه"],
    specs: [
      { key: "Power", value: "1000 W" },
      { key: "Speed Levels", value: "12" },
      { key: "Blade", value: "Stainless Steel" },
    ],
  },
  {
    name: "جارو رباتیک شیائومی (Xiaomi Robot Vacuum)",
    description:
      "جارو رباتیک شیائومی (Xiaomi Robot Vacuum) با نقشه‌برداری هوشمند و امکان کنترل از طریق تلفن همراه.",
    basePrice: 29_000_000,
    categories: ["خانه و آشپزخانه", "خانه هوشمند"],
    specs: [
      { key: "Navigation", value: "LiDAR" },
      { key: "Connection", value: "Wi-Fi" },
      { key: "Control", value: "Mobile App" },
    ],
  },
  {
    name: "جارو شارژی دایسون V12 (Dyson V12)",
    description:
      "جارو شارژی دایسون V12 (Dyson V12) سبک و قدرتمند برای نظافت روزانه خانه با باتری قابل شارژ.",
    basePrice: 48_000_000,
    categories: ["خانه و آشپزخانه"],
    specs: [
      { key: "Type", value: "Cordless" },
      { key: "Battery", value: "Up to 60 min" },
      { key: "Filtration", value: "HEPA" },
    ],
  },
  {
    name: "کفش نایکی ایر مکس ۲۷۰ (Nike Air Max 270)",
    description:
      "کفش نایکی ایر مکس ۲۷۰ (Nike Air Max 270) مناسب استفاده روزمره و پیاده‌روی با طراحی سبک و راحت.",
    basePrice: 11_000_000,
    categories: ["مد و پوشاک", "ورزش"],
    specs: [
      { key: "Material", value: "Mesh / Synthetic" },
      { key: "Gender", value: "Unisex" },
      { key: "Usage", value: "Lifestyle" },
    ],
  },
  {
    name: "کفش آدیداس اولترابوست لایت (Adidas Ultraboost Light)",
    description:
      "کفش آدیداس اولترابوست لایت (Adidas Ultraboost Light) مناسب دویدن و تمرین با کفی نرم و انعطاف‌پذیر.",
    basePrice: 13_500_000,
    categories: ["مد و پوشاک", "ورزش"],
    specs: [
      { key: "Usage", value: "Running" },
      { key: "Gender", value: "Unisex" },
      { key: "Upper", value: "Primeknit" },
    ],
  },
  {
    name: "عینک آفتابی ری‌بن ویفرر (Ray-Ban Wayfarer)",
    description:
      "عینک آفتابی ری‌بن ویفرر (Ray-Ban Wayfarer) با طراحی کلاسیک و لنز مناسب محافظت در برابر نور خورشید.",
    basePrice: 12_500_000,
    categories: ["مد و پوشاک", "لوازم جانبی"],
    specs: [
      { key: "Frame", value: "Acetate" },
      { key: "UV Protection", value: "UV400" },
      { key: "Style", value: "Wayfarer" },
    ],
  },
  {
    name: "چمدان کابین سامسونایت (Samsonite Cabin Bag)",
    description:
      "چمدان کابین سامسونایت (Samsonite Cabin Bag) سبک و مقاوم برای سفرهای کوتاه و حمل در کابین هواپیما.",
    basePrice: 15_000_000,
    categories: ["مد و پوشاک", "لوازم جانبی"],
    specs: [
      { key: "Size", value: "Cabin" },
      { key: "Material", value: "Polycarbonate" },
      { key: "Wheels", value: "4 Spinner" },
    ],
  },
  {
    name: "ژل شست‌وشوی سراوی (CeraVe Foaming Cleanser)",
    description:
      "ژل شست‌وشوی سراوی (CeraVe Foaming Cleanser) مناسب پاک‌سازی روزانه پوست نرمال تا چرب بدون ایجاد خشکی شدید.",
    basePrice: 2_400_000,
    categories: ["زیبایی و سلامت"],
    specs: [
      { key: "Volume", value: "236 ml" },
      { key: "Skin Type", value: "Normal to Oily" },
      { key: "Fragrance", value: "Fragrance Free" },
    ],
  },
  {
    name: "ضدآفتاب لاروش پوزای (La Roche-Posay Sunscreen)",
    description:
      "ضدآفتاب لاروش پوزای (La Roche-Posay Sunscreen) با محافظت بالا و بافت سبک مناسب استفاده روزانه.",
    basePrice: 3_900_000,
    categories: ["زیبایی و سلامت"],
    specs: [
      { key: "SPF", value: "50+" },
      { key: "Volume", value: "50 ml" },
      { key: "Protection", value: "UVA / UVB" },
    ],
  },
  {
    name: "سرم نیاسینامید اوردینری (The Ordinary Niacinamide)",
    description:
      "سرم نیاسینامید اوردینری (The Ordinary Niacinamide) مناسب روتین مراقبت پوست و کنترل ظاهر چربی پوست.",
    basePrice: 2_200_000,
    categories: ["زیبایی و سلامت"],
    specs: [
      { key: "Volume", value: "30 ml" },
      { key: "Niacinamide", value: "10%" },
      { key: "Zinc", value: "1%" },
    ],
  },
  {
    name: "کتاب عادت‌های اتمی (Atomic Habits)",
    description:
      "کتاب عادت‌های اتمی (Atomic Habits) نوشته جیمز کلیر درباره شکل‌دادن عادت‌های کوچک و پایدار در زندگی.",
    basePrice: 650_000,
    categories: ["کتاب"],
    specs: [
      { key: "Author", value: "James Clear" },
      { key: "Language", value: "English" },
      { key: "Format", value: "Paperback" },
    ],
  },
  {
    name: "کتاب کد تمیز (Clean Code)",
    description:
      "کتاب کد تمیز (Clean Code) نوشته رابرت سی. مارتین درباره اصول نوشتن کد خوانا و قابل نگهداری.",
    basePrice: 1_200_000,
    categories: ["کتاب", "برنامه‌نویسی"],
    specs: [
      { key: "Author", value: "Robert C. Martin" },
      { key: "Language", value: "English" },
      { key: "Topic", value: "Software Engineering" },
    ],
  },
  {
    name: "صندلی اداری ارگونومیک (Ergonomic Office Chair)",
    description:
      "صندلی اداری ارگونومیک (Ergonomic Office Chair) مناسب استفاده طولانی‌مدت پشت میز با قابلیت تنظیم ارتفاع و تکیه‌گاه.",
    basePrice: 18_000_000,
    categories: ["خانه و آشپزخانه", "اداری"],
    specs: [
      { key: "Material", value: "Mesh" },
      { key: "Height Adjustment", value: "Yes" },
      { key: "Lumbar Support", value: "Adjustable" },
    ],
  },
];

async function seed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed must not run in production");
  }

  const passwordHash = await hash("123", 12);

  await db.transaction(async (tx) => {
    // ---------------------------------------------------------
    // Check fixed reference data
    // ---------------------------------------------------------

    await tx
      .insert(roles)
      .values([{ name: "normal" }, { name: "seller" }, { name: "admin" }])
      .onConflictDoNothing();
    await tx
      .insert(sellerTypes)
      .values([{ name: "online" }, { name: "physical" }])
      .onConflictDoNothing();

    const existingRoles = await tx
      .select({
        id: roles.id,
        name: roles.name,
      })
      .from(roles);

    const normalRole = existingRoles.find((role) => role.id === 1 && role.name === "normal");

    const sellerRole = existingRoles.find((role) => role.id === 2 && role.name === "seller");

    if (!normalRole || !sellerRole) {
      throw new Error("Expected roles: 1=normal and 2=seller");
    }

    const existingSellerTypes = await tx
      .select({
        id: sellerTypes.id,
        name: sellerTypes.name,
      })
      .from(sellerTypes);

    const onlineSellerType = existingSellerTypes.find(
      (type) => type.id === 1 && type.name === "online",
    );

    const physicalSellerType = existingSellerTypes.find(
      (type) => type.id === 2 && type.name === "physical",
    );

    if (!onlineSellerType || !physicalSellerType) {
      throw new Error("Expected seller types: 1=online and 2=physical");
    }

    // ---------------------------------------------------------
    // Clear seed data + reset serial IDs
    //
    // roles and seller_types are NOT touched.
    // ---------------------------------------------------------

    await tx.execute(sql`
      TRUNCATE TABLE
        product_likes,
        product_saves,
        product_views,
        seller_products,
        product_categories,
        product_specs,
        seller_profiles,
        user_roles,
        user_profiles,
        products,
        categories,
        users,
        cities
      RESTART IDENTITY CASCADE
    `);

    // ---------------------------------------------------------
    // Cities
    // ---------------------------------------------------------

    const insertedCities = await tx
      .insert(cities)
      .values([
        {
          province: "تهران",
          city: "تهران",
        },
        {
          province: "مازندران",
          city: "ساری",
        },
        {
          province: "مازندران",
          city: "بابل",
        },
        {
          province: "مازندران",
          city: "قائم‌شهر",
        },
        {
          province: "اصفهان",
          city: "اصفهان",
        },
        {
          province: "فارس",
          city: "شیراز",
        },
        {
          province: "خراسان رضوی",
          city: "مشهد",
        },
        {
          province: "آذربایجان شرقی",
          city: "تبریز",
        },
      ])
      .returning({
        id: cities.id,
      });

    // ---------------------------------------------------------
    // Users
    //
    // 1 - 16 normal
    // 17 - 24 seller
    //
    // password: 123
    // ---------------------------------------------------------

    const userValues: Array<typeof users.$inferInsert> = Array.from({ length: 24 }, (_, index) => ({
      email: `u${index + 1}@test.com`,

      phone: `0912${String(index + 1).padStart(7, "0")}`,

      passwordHash,

      status: "active",
    }));

    const insertedUsers = await tx.insert(users).values(userValues).returning({
      id: users.id,
      email: users.email,
    });

    // ---------------------------------------------------------
    // User profiles
    // ---------------------------------------------------------

    const firstNames = [
      "علی",
      "محمد",
      "امیر",
      "رضا",
      "مهدی",
      "سینا",
      "حسین",
      "آرمان",
      "سارا",
      "نگار",
      "مریم",
      "نازنین",
      "زهرا",
      "الهام",
      "پریسا",
      "یاسمن",
      "حمید",
      "سامان",
      "میلاد",
      "پویا",
      "عرفان",
      "نیما",
      "آرش",
      "کیوان",
    ];

    const lastNames = ["احمدی", "محمدی", "رضایی", "کریمی", "مرادی", "جعفری", "حسینی", "اکبری"];

    const profileValues: Array<typeof userProfiles.$inferInsert> = insertedUsers.map(
      (user, index) => ({
        userId: user.id,

        fullName: `${getItem(firstNames, index % firstNames.length)} ${getItem(
          lastNames,
          index % lastNames.length,
        )}`,

        username: `user_${index + 1}`,

        cityId: getItem(insertedCities, index % insertedCities.length).id,
      }),
    );

    await tx.insert(userProfiles).values(profileValues);

    // ---------------------------------------------------------
    // Roles
    // ---------------------------------------------------------

    const userRoleValues: Array<typeof userRoles.$inferInsert> = insertedUsers.map(
      (user, index) => ({
        userId: user.id,

        roleId: index < 16 ? normalRole.id : sellerRole.id,
      }),
    );

    await tx.insert(userRoles).values(userRoleValues);

    // ---------------------------------------------------------
    // Seller profiles
    // ---------------------------------------------------------

    const sellerUsers = insertedUsers.slice(16);

    const shopNames = [
      "فروشگاه نوین",
      "دیجیتال لند",
      "خانه تکنولوژی",
      "مارکت پلاس",
      "مرکز آنلاین",
      "مگا شاپ",
      "فروشگاه مدرن",
      "بازار شهر",
    ];

    const sellerProfileValues: Array<typeof sellerProfiles.$inferInsert> = sellerUsers.map(
      (user, index) => ({
        userId: user.id,

        shopName: getItem(shopNames, index),

        cityId: getItem(insertedCities, (index + 2) % insertedCities.length).id,

        sellerTypeId: index % 2 === 0 ? onlineSellerType.id : physicalSellerType.id,
      }),
    );

    const insertedSellerProfiles = await tx
      .insert(sellerProfiles)
      .values(sellerProfileValues)
      .returning({
        id: sellerProfiles.id,
        userId: sellerProfiles.userId,
      });

    const sellers = [...insertedSellerProfiles].sort((a, b) => a.id - b.id);

    // ---------------------------------------------------------
    // Categories
    // ---------------------------------------------------------

    const categoryNames = [
      "کالای دیجیتال",
      "موبایل",
      "لپ‌تاپ",
      "تبلت",
      "صوتی",
      "گیمینگ",
      "ساعت هوشمند",
      "لوازم جانبی",
      "ذخیره‌سازی",
      "عکاسی و فیلم‌برداری",
      "خانه و آشپزخانه",
      "لوازم آشپزخانه",
      "خانه هوشمند",
      "مد و پوشاک",
      "زیبایی و سلامت",
      "ورزش",
      "کتاب",
      "برنامه‌نویسی",
      "اداری",
      "اپل",
      "سامسونگ",
    ];

    const insertedCategories = await tx
      .insert(categories)
      .values(
        categoryNames.map((name) => ({
          name,
        })),
      )
      .returning({
        id: categories.id,
        name: categories.name,
      });

    const categoryIdByName = new Map(
      insertedCategories.map((category) => [category.name, category.id]),
    );

    // ---------------------------------------------------------
    // Products
    // ---------------------------------------------------------

    const insertedProducts = await tx
      .insert(products)
      .values(
        productSeedData.map((product) => ({
          name: product.name,
          description: product.description,

          likesCount: 0,
          viewsCount: 0,
          savesCount: 0,
        })),
      )
      .returning({
        id: products.id,
        name: products.name,
      });

    const productIdByName = new Map(insertedProducts.map((product) => [product.name, product.id]));

    // ---------------------------------------------------------
    // Specs
    // ---------------------------------------------------------

    const specValues: Array<typeof productSpecs.$inferInsert> = [];

    for (const product of productSeedData) {
      const productId = productIdByName.get(product.name);

      if (!productId) {
        throw new Error(`Product not found: ${product.name}`);
      }

      for (const spec of product.specs) {
        specValues.push({
          productId,
          key: spec.key,
          value: spec.value,
        });
      }
    }

    await tx.insert(productSpecs).values(specValues);

    // ---------------------------------------------------------
    // Product categories
    // ---------------------------------------------------------

    const productCategoryValues: Array<typeof productCategories.$inferInsert> = [];

    for (const product of productSeedData) {
      const productId = productIdByName.get(product.name);

      if (!productId) {
        throw new Error(`Product not found: ${product.name}`);
      }

      for (const categoryName of product.categories) {
        const categoryId = categoryIdByName.get(categoryName);

        if (!categoryId) {
          throw new Error(`Category not found: ${categoryName}`);
        }

        productCategoryValues.push({
          productId,
          categoryId,
        });
      }
    }

    await tx.insert(productCategories).values(productCategoryValues);

    // ---------------------------------------------------------
    // Seller products
    //
    // First seller in each product is considered
    // the logical creator of that product.
    //
    // Each product is listed by 2-4 sellers.
    // ---------------------------------------------------------

    const sellerProductValues: Array<typeof sellerProducts.$inferInsert> = [];

    productSeedData.forEach((productData, productIndex) => {
      const productId = productIdByName.get(productData.name);

      if (!productId) {
        throw new Error(`Product not found: ${productData.name}`);
      }

      const listingCount = 2 + (productIndex % 3);

      for (let sellerOffset = 0; sellerOffset < listingCount; sellerOffset++) {
        const seller = getItem(sellers, (productIndex + sellerOffset) % sellers.length);

        // Different sellers have slightly
        // different prices.
        const priceDifference = Math.round(productData.basePrice * sellerOffset * 0.015);

        const price = productData.basePrice + priceDifference;

        const hasDiscount = (productIndex + sellerOffset) % 4 === 0;

        sellerProductValues.push({
          sellerProfileId: seller.id,

          productId,

          url: `https://seller-${seller.id}.test/product/${productId}`,

          price,

          discountPrice: hasDiscount ? Math.round(price * 0.93) : null,

          stock: 5 + ((productIndex * 7 + sellerOffset * 11) % 95),
        });
      }
    });

    await tx.insert(sellerProducts).values(sellerProductValues);

    // ---------------------------------------------------------
    // Interactions
    // ---------------------------------------------------------

    const userIds = insertedUsers.map((user) => user.id);

    const likeValues: Array<typeof productLikes.$inferInsert> = [];

    const saveValues: Array<typeof productSaves.$inferInsert> = [];

    const viewValues: Array<typeof productViews.$inferInsert> = [];

    const counters = new Map<
      number,
      {
        likes: number;
        saves: number;
        views: number;
      }
    >();

    productSeedData.forEach((_, productIndex) => {
      const product = getItem(insertedProducts, productIndex);

      const productId = product.id;

      const likeCount = 4 + (productIndex % 12);

      const saveCount = 2 + (productIndex % 7);

      const viewCount = 15 + (productIndex % 16);

      // Likes
      for (let i = 0; i < likeCount; i++) {
        const userId = getItem(userIds, (productIndex * 3 + i) % userIds.length);

        likeValues.push({
          userId,
          productId,
        });
      }

      // Saves
      for (let i = 0; i < saveCount; i++) {
        const userId = getItem(userIds, (productIndex * 5 + i + 2) % userIds.length);

        saveValues.push({
          userId,
          productId,
        });
      }

      // Views
      let registeredViewIndex = 0;

      for (let i = 0; i < viewCount; i++) {
        const anonymous = i % 5 === 0;

        const userId = anonymous
          ? null
          : getItem(userIds, (productIndex + registeredViewIndex++) % userIds.length);

        viewValues.push({
          userId,
          guestId: anonymous ? randomUUID() : null,
          productId,
        });
      }

      counters.set(productId, {
        likes: likeCount,
        saves: saveCount,
        views: viewCount,
      });
    });

    await tx.insert(productLikes).values(likeValues);

    await tx.insert(productSaves).values(saveValues);

    await tx.insert(productViews).values(viewValues);

    // ---------------------------------------------------------
    // Sync product counters
    // ---------------------------------------------------------

    for (const [productId, counts] of counters) {
      await tx
        .update(products)
        .set({
          likesCount: counts.likes,

          savesCount: counts.saves,

          viewsCount: counts.views,
        })
        .where(eq(products.id, productId));
    }
  });

  console.log("Database seeded successfully");
  console.log("Users: 24");
  console.log("Normal users: 16");
  console.log("Sellers: 8");
  console.log(`Products: ${productSeedData.length}`);
  console.log("Password for all users: 123");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Seed failed:", error);

    process.exit(1);
  });
