-- ============================================================
-- HappyTummy - MealInfo INSERT Data Only
-- Source: USDA FoodData Central (fdc.nal.usda.gov)
-- Nutritional totals calculated per meal based on
-- actual ingredient portions (not per 100g)
-- Calories: kcal | Protein: g | Fiber: g | Sugar: g
-- Age Ranges:
--   0-6  months → MinAge 0,  MaxAge 5
--   6-9  months → MinAge 6,  MaxAge 8
--   9-12 months → MinAge 9,  MaxAge 11
--   12+  months → MinAge 12, MaxAge 24
-- MealType: breakfast | lunch | dinner | snack
-- Texture:  liquid | pureed | mashed | soft | regular
-- ============================================================

USE [HappyTummy]
GO

INSERT INTO MealInfo (MealName, MealType, MinAgeMonths, MaxAgeMonths, Description, Texture, TotalCalories, TotalProtein, TotalFiber, TotalSugar)
VALUES

-- ── 0-6 MONTHS ───────────────────────────────────────────────
('Breast Milk / Formula Feed', 'breakfast', 0, 5, 'Primary nutrition for babies under 6 months. 120ml serving.',        'liquid',  84.00,  1.24, 0.00, 8.52),
('Breast Milk / Formula Feed', 'lunch',     0, 5, 'Primary nutrition for babies under 6 months. 120ml serving.',        'liquid',  84.00,  1.24, 0.00, 8.52),
('Breast Milk / Formula Feed', 'dinner',    0, 5, 'Primary nutrition for babies under 6 months. 120ml serving.',        'liquid',  84.00,  1.24, 0.00, 8.52),
('Breast Milk / Formula Feed', 'snack',     0, 5, 'Primary nutrition for babies under 6 months. 60ml serving.',         'liquid',  42.00,  0.62, 0.00, 4.26),

-- ── 6-9 MONTHS ───────────────────────────────────────────────
-- Breakfast
('Rice Porridge with Banana',          'breakfast', 6, 8, 'Smooth rice porridge blended with ripe banana. Easy to digest.',           'pureed',  91.70,  1.53, 0.53, 3.77),
('Baby Oatmeal with Pear',             'breakfast', 6, 8, 'Oatmeal cooked smooth with pureed pear. Good source of fiber.',            'pureed',  65.40,  1.64, 1.54, 4.08),
('Baby Rice Cereal with Breast Milk',  'breakfast', 6, 8, 'Iron-fortified rice cereal mixed with breast milk or formula.',            'pureed',  88.20,  1.67, 0.06, 1.56),
('Mashed Sweet Potato',                'breakfast', 6, 8, 'Plain mashed sweet potato. Rich in vitamin A and natural sweetness.',      'pureed',  51.60,  0.94, 0.84, 2.51),

-- Lunch
('Pureed Carrot and Sweet Potato',     'lunch',     6, 8, 'Blended carrot and sweet potato. Smooth and naturally sweet.',             'pureed',  38.10,  0.75, 0.72, 2.67),
('Pureed Peas and Zucchini',           'lunch',     6, 8, 'Green vegetable puree packed with fiber and vitamins.',                    'pureed',  29.40,  1.99, 0.75, 2.45),
('Pureed Chicken with Rice',           'lunch',     6, 8, 'Smooth pureed chicken breast mixed with rice porridge.',                   'pureed', 101.50, 10.27, 0.16, 0.08),
('Pureed Salmon with Sweet Potato',    'lunch',     6, 8, 'Salmon blended with sweet potato. Good source of omega-3.',               'pureed',  95.00,  5.90, 0.70, 2.09),

-- Dinner
('Pureed Broccoli and Carrot',         'dinner',    6, 8, 'Mild green vegetable puree. Good introduction to greens.',                 'pureed',  20.80,  0.98, 0.55, 1.84),
('Pureed Beef with Pumpkin',           'dinner',    6, 8, 'Iron-rich beef blended with pumpkin puree.',                              'pureed',  85.40,  8.23, 0.32, 1.10),
('Rice Porridge with Spinach',         'dinner',    6, 8, 'Mild rice congee with blended spinach. Iron and fiber rich.',             'pureed',  70.75,  1.91, 0.53, 0.20),
('Pureed Peas and Chicken',            'dinner',    6, 8, 'Protein and fiber combination, blended smooth.',                          'pureed',  73.80, 10.94, 0.60, 1.70),

-- Snack
('Pureed Apple',                       'snack',     6, 8, 'Single ingredient apple puree. Light and easy to digest.',                'pureed',  20.80,  0.10, 0.52, 4.16),
('Pureed Mango',                       'snack',     6, 8, 'Single ingredient mango puree. Vitamin C rich.',                          'pureed',  24.00,  0.33, 0.40, 5.46),
('Pureed Pear',                        'snack',     6, 8, 'Gentle pear puree. Good for digestion.',                                  'pureed',  25.65,  0.16, 0.72, 4.39),
('Banana Puree',                       'snack',     6, 8, 'Simple mashed banana. Quick energy and potassium.',                       'pureed',  44.50,  0.55, 0.55, 6.12),

-- ── 9-12 MONTHS ──────────────────────────────────────────────
-- Breakfast
('Oatmeal with Mashed Banana and Strawberry', 'breakfast', 9, 11, 'Thicker oatmeal with mashed banana and diced strawberry.',        'mashed',  75.70,  1.96, 1.43, 4.83),
('Scrambled Egg with Toast Fingers',          'breakfast', 9, 11, 'Soft scrambled egg with small strips of white bread.',            'soft',   117.25,  7.70, 0.09, 1.37),
('Yogurt with Mashed Pear',                   'breakfast', 9, 11, 'Plain yogurt mixed with mashed pear. Probiotic rich.',            'mashed',  43.95,  1.20, 0.72, 5.79),
('Baby Oat Pancake with Apple',               'breakfast', 9, 11, 'Small soft oat pancake served with pureed apple.',                'soft',    77.55,  1.60, 0.64, 5.56),

-- Lunch
('Soft Pasta with Tomato and Minced Beef',    'lunch',     9, 11, 'Small soft pasta pieces in a mild tomato and minced beef sauce.', 'soft',   184.00,  7.48, 0.50, 1.07),
('Chicken and Vegetable Rice Bowl',           'lunch',     9, 11, 'Soft rice with diced chicken breast, carrot, and peas.',          'soft',   138.90, 11.92, 0.80, 2.11),
('Tofu and Broccoli with Rice',               'lunch',     9, 11, 'Soft tofu crumbles with steamed broccoli over rice.',             'soft',    96.30,  4.46, 0.63, 0.73),
('Salmon and Sweet Potato Mash',              'lunch',     9, 11, 'Flaked salmon mixed with mashed sweet potato.',                   'mashed', 103.60,  6.05, 0.84, 2.51),

-- Dinner
('Minced Beef and Vegetable Congee',          'dinner',    9, 11, 'Rice porridge with soft minced beef, carrot, and spinach.',       'soft',   176.25,  6.14, 0.60, 1.11),
('Chicken Noodle Soup',                       'dinner',    9, 11, 'Soft egg noodles in mild broth with chicken and zucchini.',       'soft',   123.60, 11.94, 0.45, 0.96),
('Pork and Vegetable Rice',                   'dinner',    9, 11, 'Soft minced pork with green vegetables over rice.',               'soft',   148.40,  6.85, 0.29, 0.62),
('Egg and Veggie Fried Rice',                 'dinner',    9, 11, 'Soft fried rice with scrambled egg, peas, and carrot.',           'soft',   166.90,  8.90, 0.80, 2.67),

-- Snack
('Yogurt with Banana',                        'snack',     9, 11, 'Plain yogurt with mashed banana. Creamy and filling.',            'mashed',  53.90,  1.48, 0.44, 6.29),
('Soft Steamed Broccoli Florets',             'snack',     9, 11, 'Lightly steamed broccoli as finger food.',                        'soft',    13.60,  1.13, 0.40, 0.68),
('Crackers with Mashed Avocado',              'snack',     9, 11, 'Soft crackers with avocado mash. Healthy fats.',                  'soft',    42.10,  0.85, 0.04, 0.41),
('Diced Soft Pear',                           'snack',     9, 11, 'Ripe pear cut into small soft pieces. Easy to self-feed.',        'soft',    25.65,  0.16, 0.72, 4.39),

-- ── 12+ MONTHS ───────────────────────────────────────────────
-- Breakfast
('Whole Wheat Toast with Egg',                'breakfast', 12, 24, 'Whole wheat toast fingers with scrambled or boiled egg.',        'regular', 151.60,  9.20, 0.36, 1.61),
('Oatmeal with Strawberry and Banana',        'breakfast', 12, 24, 'Hearty oatmeal topped with sliced strawberry and banana.',       'regular',  77.30,  2.00, 1.48, 5.07),
('Pancake with Mango and Yogurt',             'breakfast', 12, 24, 'Small pancake served with diced mango and plain yogurt.',        'regular', 155.80,  4.36, 0.65, 9.66),
('Yogurt Parfait with Fruit and Oats',        'breakfast', 12, 24, 'Layered yogurt with oats, raspberry, and banana.',               'regular',  95.00,  3.40, 1.18, 7.44),

-- Lunch
('Chicken and Veggie Fried Rice',             'lunch',     12, 24, 'Rice stir-fried with diced chicken, egg, corn, and peas.',       'regular', 225.65, 16.34, 0.96, 2.09),
('Whole Wheat Pasta with Minced Beef Sauce',  'lunch',     12, 24, 'Whole wheat pasta with mild tomato and minced beef sauce.',      'regular', 179.50,  7.33, 0.80, 1.19),
('Salmon Rice Bowl with Broccoli',            'lunch',     12, 24, 'Steamed rice with flaked salmon and broccoli florets.',          'regular', 166.20,  8.11, 0.62, 0.55),
('Tofu and Vegetable Noodle Soup',            'lunch',     12, 24, 'Egg noodles in mild broth with tofu, spinach, and carrot.',      'regular', 104.60,  5.45, 0.94, 1.52),

-- Dinner
('Beef and Vegetable Congee',                 'dinner',    12, 24, 'Thick rice porridge with minced beef, carrot, and peas.',        'regular', 164.40, 10.30, 0.80, 2.18),
('Chicken Thigh with Sweet Potato and Peas',  'dinner',    12, 24, 'Baked chicken thigh with mashed sweet potato and peas.',         'regular', 138.60, 10.37, 1.44, 4.21),
('Pork and Vegetable Stir Fry with Rice',     'dinner',    12, 24, 'Minced pork stir-fried with bell pepper, zucchini, and rice.',   'regular', 192.50,  7.69, 0.58, 1.38),
('Shrimp and Corn Fried Rice',                'dinner',    12, 24, 'Rice with shrimp, corn, egg, and green beans.',                  'regular', 190.25, 11.29, 0.82, 1.78),

-- Snack
('Fruit Salad (Banana, Apple, Grape)',        'snack',     12, 24, 'Mixed diced fruit. Vitamin C and natural energy.',               'regular',  53.50,  0.54, 0.78, 9.37),
('Crackers with Yogurt Dip',                  'snack',     12, 24, 'Whole grain crackers with plain yogurt as a dip.',               'regular',  81.45,  2.31, 0.06, 2.01),
('Steamed Corn and Carrot Sticks',            'snack',     12, 24, 'Lightly steamed corn and carrot for self-feeding practice.',     'regular',  38.10,  1.26, 0.66, 2.39),
('Egg and Cheese Mini Pancake',               'snack',     12, 24, 'Small egg pancake. Protein-rich finger food.',                   'regular', 134.25,  7.79, 0.12, 1.96);
GO
