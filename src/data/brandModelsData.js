export const PROTECTION_TYPES = [
  { id: 'Warranty', name: 'Warranty Protection', icon: '🛡️' },
  { id: 'Insurance', name: 'Insurance Plan', icon: '📋' }
];

export const CATEGORIES_LIST = [
  // --- WARRANTY SUB-CATEGORIES ---
  { id: 'Electronics', type: 'Warranty', name: 'Electronics & Gadgets', icon: '📱' },
  { id: 'Computers', type: 'Warranty', name: 'Computers & Laptops', icon: '💻' },
  { id: 'Audio', type: 'Warranty', name: 'Audio & Wearables', icon: '🎧' },
  { id: 'Home Appliances', type: 'Warranty', name: 'Home Appliances & TV', icon: '📺' },
  { id: 'Eyewear', type: 'Warranty', name: 'Eyewear & Specs', icon: '👓' },
  { id: 'Jewelry', type: 'Warranty', name: 'Jewelry & Valuables', icon: '💍' },
  { id: 'Gaming', type: 'Warranty', name: 'Gaming Consoles & VR', icon: '🎮' },
  { id: 'Cameras', type: 'Warranty', name: 'Cameras & Optics', icon: '📷' },

  // --- INSURANCE SUB-CATEGORIES ---
  { id: 'Vehicle', type: 'Insurance', name: 'Vehicle & EV Insurance', icon: '🚗' },
  { id: 'Screen Protection', type: 'Insurance', name: 'Mobile Screen Insurance', icon: '📱' },
  { id: 'Accidental Damage', type: 'Insurance', name: 'Accidental & Liquid Damage', icon: '⚡' },
  { id: 'Home Insurance', type: 'Insurance', name: 'Home Asset & AMC Shield', icon: '🏠' },
  { id: 'Jewelry Insurance', type: 'Insurance', name: 'Jewelry Theft & All-Risk', icon: '💎' },
  { id: 'Travel Protection', type: 'Insurance', name: 'Travel Gadget Protection', icon: '✈️' }
];

export const BRAND_MODELS_DB = {
  // --- ELECTRONICS & GADGETS ---
  Apple: {
    logo: '🍎',
    category: 'Electronics',
    models: [
      'iPhone 15 Pro Max 256GB', 'iPhone 15 Pro 128GB', 'iPhone 15 128GB', 'iPhone 15 Plus',
      'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone SE (3rd Gen)',
      'MacBook Pro M3 Max 16"', 'MacBook Pro M3 Pro 14"', 'MacBook Air M3 15"', 'MacBook Air M2 13"',
      'iPad Pro 12.9" M2', 'iPad Air M2 11"', 'iPad Mini (6th Gen)', 'iPad (10th Gen)',
      'Apple Watch Ultra 2', 'Apple Watch Series 9', 'Apple Watch SE',
      'AirPods Pro (2nd Gen)', 'AirPods Max', 'AirPods (3rd Gen)',
      'Mac Studio M2 Ultra', 'iMac 24" M3', 'Mac Mini M2'
    ]
  },
  Samsung: {
    logo: '📱',
    category: 'Electronics',
    models: [
      'Galaxy S24 Ultra 5G', 'Galaxy S24+ 5G', 'Galaxy S24 5G', 'Galaxy S23 FE',
      'Galaxy Z Fold 5 5G', 'Galaxy Z Flip 5 5G', 'Galaxy A55 5G', 'Galaxy A35 5G',
      'Galaxy Tab S9 Ultra', 'Galaxy Tab S9 FE', 'Galaxy Book4 Pro 360',
      'Galaxy Watch 6 Classic', 'Galaxy Watch 5 Pro', 'Galaxy Buds2 Pro',
      'Neo QLED 8K Smart TV 65"', 'OLED 4K Smart TV 55"', 'Bespoke French Door Refrigerator'
    ]
  },
  Sony: {
    logo: '🎮',
    category: 'Electronics',
    models: [
      'PlayStation 5 Disc Edition', 'PlayStation 5 Digital Edition', 'PlayStation Portal',
      'WH-1000XM5 Wireless Headphones', 'WF-1000XM5 Noise Canceling Earbuds', 'LinkBuds S',
      'Bravia XR OLED 4K TV 65"', 'Bravia 9 Mini LED 4K TV', 'HT-A7000 Soundbar',
      'Alpha 7 IV Full-Frame Camera', 'Alpha 7R V Camera', 'FX3 Cinema Line Camera',
      'Xperia 1 VI 5G', 'Xperia 5 V'
    ]
  },
  OnePlus: {
    logo: '1+',
    category: 'Electronics',
    models: [
      'OnePlus 12 5G (16GB RAM)', 'OnePlus 12R 5G', 'OnePlus Open Foldable',
      'OnePlus Nord 4 5G', 'OnePlus Nord CE 4 5G', 'OnePlus 11 5G',
      'OnePlus Pad 2 Tablet', 'OnePlus Pad Go', 'OnePlus Watch 2',
      'OnePlus Buds Pro 2', 'OnePlus Nord Buds 2r', 'OnePlus TV U1S 55"'
    ]
  },
  Google: {
    logo: '🌐',
    category: 'Electronics',
    models: [
      'Pixel 8 Pro 256GB', 'Pixel 8 128GB', 'Pixel 8a 5G', 'Pixel Fold 5G',
      'Pixel 7a', 'Pixel Tablet with Speaker Dock', 'Pixel Watch 2 LTE',
      'Pixel Buds Pro', 'Nest WiFi Pro 6E', 'Nest Doorbell Wired'
    ]
  },
  Xiaomi: {
    logo: '🟠',
    category: 'Electronics',
    models: [
      'Xiaomi 14 Ultra 5G', 'Xiaomi 14 5G', 'Xiaomi 13 Pro',
      'Redmi Note 13 Pro+ 5G', 'Redmi Note 13 5G', 'Redmi 13C 5G',
      'Xiaomi Pad 6', 'Redmi Pad SE', 'Xiaomi Smart TV X Pro 55"',
      'Mi Robot Vacuum-Mop 2 Pro', 'Mi Smart Air Purifier 4'
    ]
  },
  Vivo: {
    logo: '🔷',
    category: 'Electronics',
    models: [
      'Vivo X100 Pro 5G', 'Vivo X100 5G', 'Vivo V30 Pro 5G', 'Vivo V30 5G',
      'Vivo Y200e 5G', 'Vivo T3 5G', 'Vivo X90 Pro'
    ]
  },
  Oppo: {
    logo: '🟢',
    category: 'Electronics',
    models: [
      'Oppo Find N3 Flip', 'Oppo Reno 11 Pro 5G', 'Oppo Reno 11 5G',
      'Oppo F25 Pro 5G', 'Oppo A79 5G', 'Oppo Enco Air 3 Pro'
    ]
  },
  Realme: {
    logo: '🟡',
    category: 'Electronics',
    models: [
      'Realme 12 Pro+ 5G', 'Realme 12 Pro 5G', 'Realme GT 5 Pro',
      'Realme Narzo 70 Pro 5G', 'Realme P1 5G', 'Realme Buds Air 5 Pro'
    ]
  },
  Motorola: {
    logo: 'Ⓜ️',
    category: 'Electronics',
    models: [
      'Moto Razr 40 Ultra', 'Moto Edge 50 Pro 5G', 'Moto Edge 50 Fusion',
      'Moto G84 5G', 'Moto G54 5G', 'Moto Buds+'
    ]
  },

  // --- HOME APPLIANCES & TV ---
  Bosch: {
    logo: '🧺',
    category: 'Home Appliances',
    models: [
      'Bosch Serie 6 8kg Front Load Washing Machine', 'Bosch Serie 4 7kg Washing Machine',
      'Bosch Serie 8 Heat Pump Tumble Dryer', 'Bosch 14 Place Settings Dishwasher',
      'Bosch Serie 4 Frost Free Refrigerator 358L', 'Bosch Built-in Induction Hob'
    ]
  },
  Whirlpool: {
    logo: '🧺',
    category: 'Home Appliances',
    models: [
      'Whirlpool 7.5kg Royal Fully Automatic Top Load', 'Whirlpool Intellifresh 340L Convertible Refrigerator',
      'Whirlpool 1.5 Ton 5 Star Inverter Split AC', 'Whirlpool Magicook Microwave Oven'
    ]
  },
  LG: {
    logo: '📺',
    category: 'Home Appliances',
    models: [
      'LG 8kg Direct Drive Front Load Washer', 'LG OLED evo C3 65" 4K Smart TV',
      'LG 655L Side-by-Side Refrigerator with InstaView', 'LG 1.5 Ton 5 Star AI Dual Inverter Split AC'
    ]
  },

  // --- COMPUTERS & LAPTOPS ---
  Logitech: {
    logo: '🖱️',
    category: 'Computers',
    models: [
      'Logitech MX Master 3S Wireless Mouse', 'Logitech MX Keys S Wireless Keyboard',
      'Logitech G Pro X Superlight 2 Gaming Mouse', 'Logitech Brio 4K Ultra HD Webcam',
      'Logitech Zone Wireless Headset', 'Logitech G915 LIGHTSPEED Wireless RGB Mechanical Keyboard'
    ]
  },
  Razer: {
    logo: '🐍',
    category: 'Computers',
    models: [
      'Razer Viper V3 Pro Wireless Mouse', 'Razer DeathAdder V3 Pro',
      'Razer Huntsman V3 Pro Keyboard', 'Razer BlackShark V2 Pro Headset'
    ]
  },
  Dell: {
    logo: '💻',
    category: 'Computers',
    models: [
      'XPS 16 Laptop (Intel Core Ultra 9)', 'XPS 14 Laptop', 'XPS 13 Plus',
      'Alienware m18 R2 Gaming Laptop', 'Alienware x16 R2', 'Alienware Aurora R16 Desktop',
      'Latitude 7440 Ultrabook', 'Precision 7780 Workstation', 'Inspiron 16 Plus'
    ]
  },
  HP: {
    logo: '🖥️',
    category: 'Computers',
    models: [
      'Spectre x360 16 2-in-1', 'Spectre x360 14', 'OMEN 16 Gaming Laptop',
      'OMEN 45L Gaming Desktop', 'Envy x360 15', 'Pavilion Plus 14',
      'HP ZBook Studio G10 Workstation', 'EliteBook 840 G10'
    ]
  },
  Lenovo: {
    logo: '💻',
    category: 'Computers',
    models: [
      'Legion Pro 7i Gen 9', 'Legion Slim 5', 'ThinkPad X1 Carbon Gen 12',
      'ThinkPad P1 Gen 6 Workstation', 'Yoga Book 9i Dual Screen', 'Yoga 9i Gen 9',
      'IdeaPad Slim 5i', 'LOQ 15 Gaming Laptop'
    ]
  },
  Asus: {
    logo: '⚡',
    category: 'Computers',
    models: [
      'ROG Zephyrus G16 (2024 OLED)', 'ROG Strix SCAR 18', 'ROG Ally X Handheld',
      'TUF Gaming A15', 'Zenbook 14 OLED', 'Zenbook DUO Dual Screen',
      'ProArt Studiobook 16 OLED', 'Vivobook Pro 15'
    ]
  },
  Acer: {
    logo: '💻',
    category: 'Computers',
    models: [
      'Predator Helios 18 Gaming', 'Predator Helios 16', 'Nitro 16 Gaming',
      'Swift Go 14 OLED', 'Swift X 16', 'Aspire 7 Gaming', 'Chromebook Plus 515'
    ]
  },

  // --- VEHICLE & EV INSURANCE ---
  'Maruti Suzuki': {
    logo: '🚗',
    category: 'Vehicle',
    models: [
      'Maruti Suzuki Brezza ZXi+ Automatic', 'Maruti Suzuki Grand Vitara Alpha Hybrid',
      'Maruti Suzuki Swift ZXi+ 2024', 'Maruti Suzuki Baleno Alpha AGS',
      'Maruti Suzuki Jimny Alpha 4x4 Automatic', 'Maruti Suzuki Ertiga ZXi+ CNG',
      'Maruti Suzuki Fronx Alpha 1.0 Turbo', 'Maruti Suzuki Dzire ZXi+ AMT',
      'Maruti Suzuki Invicto Alpha+ 7-Seater', 'Maruti Suzuki XL6 Alpha+ CNG',
      'Maruti Suzuki Alto K10 VXi+', 'Maruti Suzuki WagonR ZXi+ 1.2',
      'Maruti Suzuki Celerio ZXi+ AMT', 'Maruti Suzuki Ignis Alpha AMT',
      'Maruti Suzuki S-Presso VXi+ CNG', 'Maruti Suzuki Ciaz Alpha 1.5',
      'Maruti Suzuki Eeco 7-Seater', 'Maruti Suzuki Brezza LXi CNG'
    ]
  },
  Hyundai: {
    logo: '🚘',
    category: 'Vehicle',
    models: [
      'Hyundai Creta SX (O) Turbo Petrol DCT', 'Hyundai Creta N Line N8',
      'Hyundai Venue SX (O) Turbo DCT', 'Hyundai Venue N Line N8',
      'Hyundai Verna SX (O) Turbo DCT', 'Hyundai i20 Asta (O) IVT',
      'Hyundai i20 N Line N8', 'Hyundai Tucson Signature 2.0 Diesel AWD',
      'Hyundai Alcazar Signature 6-Seater Petrol', 'Hyundai IONIQ 5 EV (72.6kWh)',
      'Hyundai Exter SX (O) Connect AMT', 'Hyundai Aura SX (+) AMT',
      'Hyundai Grand i10 Nios Asta AMT', 'Hyundai Kona Electric Premium'
    ]
  },
  Toyota: {
    logo: '🚙',
    category: 'Vehicle',
    models: [
      'Toyota Fortuner GR-Sport 4x4 Diesel AT', 'Toyota Fortuner Legender 4x4 AT',
      'Toyota Innova Hycross ZX (O) Hybrid', 'Toyota Innova Crysta VX 2.4 Diesel',
      'Toyota Urban Cruiser Taisor V Turbo AT', 'Toyota Glanza V AMT',
      'Toyota Hilux High 4x4 AT', 'Toyota Camry Hybrid 2.5 CVT',
      'Toyota Vellfire Executive Lounge Hybrid', 'Toyota Land Cruiser 300 ZX Diesel'
    ]
  },
  'Tata Motors': {
    logo: '🚘',
    category: 'Vehicle',
    models: [
      'Tata Nexon Fearless+ S Dark Edition DCT', 'Tata Nexon EV Empowered+ LR (40.5kWh)',
      'Tata Harrier Fearless+ Dark AT', 'Tata Safari Accomplished+ Dark 6-Seater AT',
      'Tata Punch Creative Flagship Dual Tone AMT', 'Tata Punch EV Empowered+ S LR',
      'Tata Altroz XZ+ O (S) Turbo Petrol', 'Tata Tiago EV Tech Lux Long Range',
      'Tata Tigor EV XZ+ Lux', 'Tata Tiago XZ+ iCNG AMT', 'Tata Curvv EV Coupe'
    ]
  },
  Mahindra: {
    logo: '🚙',
    category: 'Vehicle',
    models: [
      'Mahindra Thar Roxx AX7L 4x4 Automatic', 'Mahindra Thar LX Hard Top 4x4 Diesel AT',
      'Mahindra XUV700 AX7 Luxury Pack AWD Diesel AT', 'Mahindra Scorpio-N Z8L 4x4 Diesel AT',
      'Mahindra Scorpio Classic S11 7-Seater', 'Mahindra Bolero Neo N10 Option',
      'Mahindra XUV3XO AX7L Turbo Petrol AT', 'Mahindra XUV400 EV EL Pro (39.4kWh)',
      'Mahindra Bolero B6 Option', 'Mahindra Marazzo M6 Plus'
    ]
  },
  Honda: {
    logo: '🚗',
    category: 'Vehicle',
    models: [
      'Honda Elevate ZX CVT Automatic', 'Honda City 5th Gen ZX CVT',
      'Honda City e:HEV Strong Hybrid ZX', 'Honda Amaze VX CVT Automatic',
      'Honda WR-V VX Petrol', 'Honda Civic ZX Turbo CVT', 'Honda Accord Hybrid'
    ]
  },
  BMW: {
    logo: '🏎️',
    category: 'Vehicle',
    models: [
      'BMW X7 xDrive40i M Sport', 'BMW X5 xDrive30d M Sport',
      'BMW X3 xDrive20d M Sport', 'BMW X1 sDrive18i M Sport',
      'BMW 3 Series Gran Limousine 330Li M Sport', 'BMW 5 Series 530Li M Sport',
      'BMW 7 Series 740i M Sport', 'BMW i4 eDrive40 Electric Gran Coupe',
      'BMW iX xDrive50 Electric SUV', 'BMW M3 Competition xDrive', 'BMW M5 CS'
    ]
  },
  'Mercedes-Benz': {
    logo: '🌟',
    category: 'Vehicle',
    models: [
      'Mercedes-AMG G 63 V8 Biturbo', 'Mercedes-Benz S-Class S 450 4MATIC',
      'Mercedes-Benz E-Class E 220d Exclusive', 'Mercedes-Benz C-Class C 300d',
      'Mercedes-Benz GLS 450d 4MATIC', 'Mercedes-Benz GLE 450d 4MATIC',
      'Mercedes-Benz GLC 300 4MATIC', 'Mercedes-Benz GLA 220d AMG Line',
      'Mercedes-Benz EQE 500 4MATIC SUV', 'Mercedes-AMG GT 63 S E Performance'
    ]
  },
  Audi: {
    logo: '🏎️',
    category: 'Vehicle',
    models: [
      'Audi Q8 55 TFSI Quattro', 'Audi Q7 55 TFSI Technology',
      'Audi Q5 45 TFSI Technology', 'Audi Q3 40 TFSI Quattro',
      'Audi A8L 55 TFSI Celebration', 'Audi A6 45 TFSI Technology',
      'Audi A4 40 TFSI Technology', 'Audi RS e-tron GT Electric', 'Audi RS5 Sportback'
    ]
  },
  Volkswagen: {
    logo: '🚘',
    category: 'Vehicle',
    models: [
      'Volkswagen Taigun GT Edge Limited Edition DSG', 'Volkswagen Virtus GT Plus 1.5 TSI DSG',
      'Volkswagen Tiguan 2.0 TSI Elegance AWD', 'Volkswagen Golf GTI 2.0 TSI'
    ]
  },
  Kia: {
    logo: '🚘',
    category: 'Vehicle',
    models: [
      'Kia Seltos GTX+ Diesel AT', 'Kia Seltos X-Line Turbo DCT',
      'Kia Sonet GTX+ Turbo DCT', 'Kia Carens Luxury Plus 1.5 Turbo DCT',
      'Kia EV6 GT-Line AWD (77.4kWh)', 'Kia Carnival Limousine 7-Seater'
    ]
  },
  'Royal Enfield': {
    logo: '🏍️',
    category: 'Vehicle',
    models: [
      'Royal Enfield Classic 350 Chrome Dual Channel ABS', 'Royal Enfield Hunter 350 Rebel Blue',
      'Royal Enfield Meteor 350 Supernova', 'Royal Enfield Himalayan 450 Kamet White',
      'Royal Enfield Bullet 350 Black Gold', 'Royal Enfield Continental GT 650 Apex Grey',
      'Royal Enfield Interceptor 650 Barcelona Blue', 'Royal Enfield Shotgun 650 Icon Yellow',
      'Royal Enfield Guerrilla 450 Playa Black'
    ]
  },
  'Hero MotoCorp': {
    logo: '🏍️',
    category: 'Vehicle',
    models: [
      'Hero Splendor Plus XTEC i3S', 'Hero Karizma XMR 210', 'Hero Mavrick 440',
      'Hero Xpulse 200 4V Pro Edition', 'Hero Glamour XTEC 125', 'Hero Passion XTEC',
      'Hero Xoom 110 ZX Scooter', 'Hero Destini Prime 125'
    ]
  },
  Ather: {
    logo: '⚡',
    category: 'Vehicle',
    models: [
      'Ather 450X Apex 3.7kWh EV', 'Ather 450X Gen 3 3.7kWh',
      'Ather 450S 2.9kWh', 'Ather Rizta Z Family Scooter'
    ]
  },

  // --- EYEWEAR & SPECS ---
  Lenskart: {
    logo: '👓',
    category: 'Eyewear',
    models: [
      'Lenskart Air Flex Super Light Titanium Frame', 'Vincent Chase Polarized Aviator Sunglasses',
      'John Jacobs Acetate Premium Glasses', 'Lenskart Blu Zero Anti-Glare Computer Specs',
      'Lenskart Hustlr Gaming Blue-Cut Eyewear', 'Lenskart Studio Designer Cat-Eye Specs'
    ]
  },
  'Titan Eye+': {
    logo: '👓',
    category: 'Eyewear',
    models: [
      'Titan Eye+ Flexible Memory Metal Frame', 'Fastrack Sporty Wrap-Around Sunglasses',
      'Titan Enigma Rimless Titanium Glasses', 'Titan Progressive Anti-Reflective Specs'
    ]
  },
  'Ray-Ban': {
    logo: '🕶️',
    category: 'Eyewear',
    models: [
      'Ray-Ban Wayfarer Classic RB2140 Polarized', 'Ray-Ban Aviator Gradient Gold Frame',
      'Ray-Ban Clubmaster Classic Acetate', 'Ray-Ban Erika Round Sunglasses',
      'Ray-Ban Hexagonal Flat Lenses Gold'
    ]
  },
  Oakley: {
    logo: '🕶️',
    category: 'Eyewear',
    models: [
      'Oakley Holbrook Prizm Polarized Sunglasses', 'Oakley Radar EV Path Sport Glasses',
      'Oakley Flak 2.0 XL Golf Sunglasses', 'Oakley Frogskins Heritage Collection'
    ]
  },

  // --- JEWELRY & PRECIOUS VALUABLES ---
  Tanishq: {
    logo: '💍',
    category: 'Jewelry',
    models: [
      'Tanishq Solitaire Diamond Engagement Ring (1.5 Carat VVS1)',
      'Tanishq 22K Yellow Gold Bridal Choker Necklace',
      'Tanishq Mia Diamond Drop Earrings',
      'Tanishq 24K Pure Gold Coin Bar 10g',
      'Tanishq Royal Heritage Ruby & Diamond Bangle Set'
    ]
  },
  'Kalyan Jewellers': {
    logo: '💎',
    category: 'Jewelry',
    models: [
      'Kalyan Mudhra Antique Gold Temple Necklace',
      'Kalyan Anokhi Uncut Polki Diamond Choker',
      'Kalyan Antara Certified Diamond Pendant Chain'
    ]
  },
  'Malabar Gold': {
    logo: '💍',
    category: 'Jewelry',
    models: [
      'Malabar Mine Solitaire Diamond Ring',
      'Malabar Era Uncut Diamond & Emerald Necklace',
      'Malabar 24K Gold Bar Bullion (50 Grams)'
    ]
  },
  CaratLane: {
    logo: '💎',
    category: 'Jewelry',
    models: [
      'CaratLane Blaze Solitaire Diamond Ring',
      'CaratLane Everyday Wear 18K Rose Gold Chain',
      'CaratLane Diamond Tennis Bracelet'
    ]
  },
  BlueStone: {
    logo: '💍',
    category: 'Jewelry',
    models: [
      'BlueStone Classique Diamond Stud Earrings',
      'BlueStone Royal Gold Kada Bracelet for Men'
    ]
  }
};

