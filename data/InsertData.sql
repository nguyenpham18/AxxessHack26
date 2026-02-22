-- ============================================================
-- HappyTummy Database - Expanded Nutritional Data
-- Original 9 fruits, 15 carbs, 14 vegs, 10 meats, 5+4 milk
-- ADDED: 9 fruits, 8 carbs, 9 vegs, 7 meats
-- Source: USDA FoodData Central (fdc.nal.usda.gov)
-- All values per 100g unless otherwise noted
-- Calories: kcal | Protein: g | Sugar: g | Fiber: g
-- ============================================================

USE [HappyTummy]
GO

-- ============================================================
-- FRUIT INFO
-- Original IDs 1-9 already inserted. Add IDs 10-18 below.
-- ============================================================
INSERT INTO FruitInfo (FruitID, FruitFood, FruitFiber, FruitCalories, FruitProtein, FruitSugar, QuantityFruit)
VALUES
(10, 'Blueberry',        2.4,  57,  0.74,  9.96, 30),
(11, 'Peach',            1.5,  39,  0.91,  8.39, 50),
(12, 'Watermelon',       0.4,  30,  0.61,  6.20, 80),
(13, 'Kiwi',             3.0,  61,  1.14, 14.66, 50),
(14, 'Avocado',          6.7, 160,  2.00,  0.66, 30),
(15, 'Papaya',           1.7,  43,  0.47,  7.82, 60),
(16, 'Cantaloupe',       0.9,  34,  0.84,  7.86, 60),
(17, 'Apricot',          2.0,  48,  1.40,  9.24, 50),
(18, 'Plum',             1.4,  46,  0.70, 10.02, 50);
GO

-- ============================================================
-- CARB INFO
-- Original IDs 1-15 already inserted. Add IDs 16-23 below.
-- ============================================================
INSERT INTO CarbInfo (CarbID, CarbFood, CarbFiber, CarbCalories, CarbProtein, CarbSugar, QuantityCarb)
VALUES
(16, 'Quinoa (cooked)',        2.8, 120,  4.40, 0.70,  80),
(17, 'Potato (mashed)',        1.8,  83,  2.00, 0.70, 100),
(18, 'Lentils (cooked)',       7.9, 116,  9.02, 1.80,  60),
(19, 'Chickpeas (cooked)',     7.6, 164,  8.86, 2.68,  60),
(20, 'Baby rice cake',         0.8, 387,  7.50, 1.20,  10),
(21, 'Couscous (cooked)',      1.4, 112,  3.79, 0.10,  60),
(22, 'Barley (cooked)',        3.8, 123,  2.26, 0.28,  80),
(23, 'Soft polenta',           1.0,  70,  1.80, 0.50, 100);
GO

-- ============================================================
-- VEG INFO
-- Original IDs 1-14 already inserted. Add IDs 15-23 below.
-- ============================================================
INSERT INTO VegInfo (VegID, VegFood, VegFiber, VegCalories, VegProtein, VegSugar, QuantityVeg)
VALUES
(15, 'Asparagus',      2.1,  20,  2.20, 1.88, 30),
(16, 'Eggplant',       3.0,  25,  0.98, 3.53, 40),
(17, 'Beet',           2.8,  43,  1.61, 6.76, 40),
(18, 'Edamame',        5.2, 121,  8.82, 2.18, 40),
(19, 'Bok choy',       1.0,  13,  1.50, 1.18, 40),
(20, 'Mushroom',       1.0,  22,  3.09, 2.00, 30),
(21, 'Parsnip',        4.4,  75,  1.20, 4.80, 40),
(22, 'Turnip',         1.8,  28,  0.90, 3.80, 40),
(23, 'Butternut squash',2.0, 45,  1.00, 4.00, 50);
GO

-- ============================================================
-- MEAT INFO
-- Original IDs 1-10 already inserted. Add IDs 11-17 below.
-- ============================================================
INSERT INTO MeatInfo (MeatID, MeatFood, MeatFiber, MeatCalories, MeatProtein, MeatSugar, QuantityMeat)
VALUES
(11, 'Tuna (canned in water)', 0.0,  86, 19.44, 0.0, 30),
(12, 'Tilapia',                0.0,  96, 20.08, 0.0, 30),
(13, 'Turkey breast',          0.0, 135, 29.94, 0.0, 30),
(14, 'Lamb (minced)',          0.0, 258, 16.57, 0.0, 30),
(15, 'Sardine (canned)',       0.0, 208, 24.62, 0.0, 25),
(16, 'Cod',                    0.0,  82, 17.81, 0.0, 30),
(17, 'Duck (minced)',          0.0, 337, 11.49, 0.0, 30);
GO

-- ============================================================
-- MILK1 (under 12 months) — original IDs 1-5 already inserted
-- No new items needed, existing 5 cover all cases
-- ============================================================

-- ============================================================
-- MILK2 (12 months+) — original IDs 1-4 already inserted
-- No new items needed, existing 4 cover all cases
-- ============================================================

-- ============================================================
-- COMPLETE REFERENCE (all values per 100g)
-- ============================================================
-- FRUITS (IDs 1-18):
--  1  Banana (ripe)     cal:89   prot:1.09  fiber:1.1  sugar:12.23
--  2  Apple              cal:52   prot:0.26  fiber:1.3  sugar:10.39
--  3  Grape              cal:69   prot:0.72  fiber:0.6  sugar:15.48
--  4  Orange             cal:47   prot:0.94  fiber:1.2  sugar:9.35
--  5  Mango              cal:60   prot:0.82  fiber:1.0  sugar:13.66
--  6  Strawberry         cal:32   prot:0.67  fiber:1.0  sugar:4.89
--  7  Prunes             cal:240  prot:2.18  fiber:2.0  sugar:38.13
--  8  Pear               cal:57   prot:0.36  fiber:1.6  sugar:9.75
--  9  Raspberry          cal:52   prot:1.20  fiber:2.0  sugar:4.42
-- 10  Blueberry          cal:57   prot:0.74  fiber:2.4  sugar:9.96
-- 11  Peach              cal:39   prot:0.91  fiber:1.5  sugar:8.39
-- 12  Watermelon         cal:30   prot:0.61  fiber:0.4  sugar:6.20
-- 13  Kiwi               cal:61   prot:1.14  fiber:3.0  sugar:14.66
-- 14  Avocado            cal:160  prot:2.00  fiber:6.7  sugar:0.66
-- 15  Papaya             cal:43   prot:0.47  fiber:1.7  sugar:7.82
-- 16  Cantaloupe         cal:34   prot:0.84  fiber:0.9  sugar:7.86
-- 17  Apricot            cal:48   prot:1.40  fiber:2.0  sugar:9.24
-- 18  Plum               cal:46   prot:0.70  fiber:1.4  sugar:10.02

-- CARBS (IDs 1-23):
--  1  White rice          cal:130  prot:2.69  fiber:0.4  sugar:0.05
--  2  Brown rice          cal:216  prot:4.52  fiber:0.9  sugar:0.69
--  3  Rice porridge       cal:65   prot:1.20  fiber:0.2  sugar:0.10
--  4  Bread (white)       cal:265  prot:9.43  fiber:0.6  sugar:5.37
--  5  Bread (whole wheat) cal:247  prot:9.70  fiber:1.2  sugar:3.50
--  6  Pasta (white)       cal:158  prot:5.80  fiber:0.7  sugar:0.56
--  7  Pasta (whole wheat) cal:149  prot:5.50  fiber:1.3  sugar:0.80
--  8  Mac n Cheese        cal:164  prot:5.87  fiber:0.5  sugar:2.33
--  9  Oatmeal             cal:71   prot:2.50  fiber:1.5  sugar:0.30
-- 10  Baby cereal (rice)  cal:371  prot:7.30  fiber:0.3  sugar:0.70
-- 11  Baby cereal (oat)   cal:380  prot:9.00  fiber:1.0  sugar:1.50
-- 12  Crackers            cal:421  prot:8.50  fiber:0.4  sugar:4.10
-- 13  Pancake / waffle    cal:227  prot:5.98  fiber:0.5  sugar:5.60
-- 14  Noodles (egg/white) cal:138  prot:4.54  fiber:0.6  sugar:0.42
-- 15  Yogurt (plain)      cal:61   prot:3.47  fiber:0.0  sugar:4.66
-- 16  Quinoa (cooked)     cal:120  prot:4.40  fiber:2.8  sugar:0.70
-- 17  Potato (mashed)     cal:83   prot:2.00  fiber:1.8  sugar:0.70
-- 18  Lentils (cooked)    cal:116  prot:9.02  fiber:7.9  sugar:1.80
-- 19  Chickpeas (cooked)  cal:164  prot:8.86  fiber:7.6  sugar:2.68
-- 20  Baby rice cake      cal:387  prot:7.50  fiber:0.8  sugar:1.20
-- 21  Couscous (cooked)   cal:112  prot:3.79  fiber:1.4  sugar:0.10
-- 22  Barley (cooked)     cal:123  prot:2.26  fiber:3.8  sugar:0.28
-- 23  Soft polenta        cal:70   prot:1.80  fiber:1.0  sugar:0.50

-- VEGS (IDs 1-23):
--  1  Carrot              cal:41   prot:0.93  fiber:1.0  sugar:4.74
--  2  Corn                cal:86   prot:3.27  fiber:1.2  sugar:3.22
--  3  Peas                cal:81   prot:5.42  fiber:2.0  sugar:5.67
--  4  Sweet potatoes      cal:86   prot:1.57  fiber:1.4  sugar:4.18
--  5  Pumpkin             cal:26   prot:1.00  fiber:0.8  sugar:2.76
--  6  Broccoli            cal:34   prot:2.82  fiber:1.0  sugar:1.70
--  7  Cauliflower         cal:25   prot:1.92  fiber:0.6  sugar:1.91
--  8  Green beans         cal:31   prot:1.83  fiber:1.0  sugar:3.26
--  9  Zucchini            cal:17   prot:1.21  fiber:0.5  sugar:2.50
-- 10  Cucumber            cal:15   prot:0.65  fiber:0.2  sugar:1.67
-- 11  Cherry tomato       cal:18   prot:0.88  fiber:0.5  sugar:2.63
-- 12  Lettuce             cal:15   prot:1.36  fiber:0.3  sugar:1.97
-- 13  Bell peppers        cal:31   prot:0.99  fiber:0.8  sugar:4.20
-- 14  Spinach             cal:23   prot:2.86  fiber:1.3  sugar:0.42
-- 15  Asparagus           cal:20   prot:2.20  fiber:2.1  sugar:1.88
-- 16  Eggplant            cal:25   prot:0.98  fiber:3.0  sugar:3.53
-- 17  Beet                cal:43   prot:1.61  fiber:2.8  sugar:6.76
-- 18  Edamame             cal:121  prot:8.82  fiber:5.2  sugar:2.18
-- 19  Bok choy            cal:13   prot:1.50  fiber:1.0  sugar:1.18
-- 20  Mushroom            cal:22   prot:3.09  fiber:1.0  sugar:2.00
-- 21  Parsnip             cal:75   prot:1.20  fiber:4.4  sugar:4.80
-- 22  Turnip              cal:28   prot:0.90  fiber:1.8  sugar:3.80
-- 23  Butternut squash    cal:45   prot:1.00  fiber:2.0  sugar:4.00

-- MEATS (IDs 1-17):
--  1  Beef                cal:250  prot:26.10 fiber:0.0  sugar:0.0
--  2  Pork                cal:242  prot:27.32 fiber:0.0  sugar:0.0
--  3  Salmon              cal:208  prot:20.42 fiber:0.0  sugar:0.0
--  4  Chicken breast      cal:165  prot:31.02 fiber:0.0  sugar:0.0
--  5  Shrimp              cal:99   prot:24.00 fiber:0.0  sugar:0.0
--  6  Egg                 cal:155  prot:12.58 fiber:0.0  sugar:1.12
--  7  Tofu                cal:76   prot:8.08  fiber:0.6  sugar:0.93
--  8  Chicken thigh       cal:209  prot:26.00 fiber:0.0  sugar:0.0
--  9  Minced pork         cal:263  prot:17.00 fiber:0.0  sugar:0.0
-- 10  Minced beef         cal:332  prot:14.39 fiber:0.0  sugar:0.0
-- 11  Tuna (canned/water) cal:86   prot:19.44 fiber:0.0  sugar:0.0
-- 12  Tilapia             cal:96   prot:20.08 fiber:0.0  sugar:0.0
-- 13  Turkey breast       cal:135  prot:29.94 fiber:0.0  sugar:0.0
-- 14  Lamb (minced)       cal:258  prot:16.57 fiber:0.0  sugar:0.0
-- 15  Sardine (canned)    cal:208  prot:24.62 fiber:0.0  sugar:0.0
-- 16  Cod                 cal:82   prot:17.81 fiber:0.0  sugar:0.0
-- 17  Duck (minced)       cal:337  prot:11.49 fiber:0.0  sugar:0.0

-- ALLERGEN FLAGS:
-- Shrimp (MeatID 5)         → common allergen
-- Egg (MeatID 6)            → common allergen
-- Salmon (MeatID 3)         → common allergen
-- Sardine (MeatID 15)       → common allergen
-- Tilapia (MeatID 12)       → common allergen
-- Tuna (MeatID 11)          → common allergen, high mercury - limit frequency
-- Wheat: CarbIDs 4,5,12,13  → common allergen
-- Edamame/Soy (VegID 18)    → common allergen

-- NOTES:
-- Tuna: limit to 1-2x per week for babies due to mercury content
-- Avocado: technically a fruit but also a healthy fat source
-- Lentils/Chickpeas: introduce slowly, may cause gas in some babies
-- Edamame: good plant-based protein but soy allergy flag applies
-- Duck: introduce after 12 months, higher fat content
-- All cooked meat values represent cooked/prepared state
-- Sugar column reflects naturally occurring sugars only
-- Source: USDA FoodData Central (fdc.nal.usda.gov)
-- ============================================================