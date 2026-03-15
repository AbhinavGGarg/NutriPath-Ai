window.NutriData = {
  communities: {
    "Nairobi West": { lat: -1.2921, lng: 36.8219, country: "Kenya" },
    "Kampala Central": { lat: 0.3476, lng: 32.5825, country: "Uganda" },
    "Lusaka South": { lat: -15.3875, lng: 28.3228, country: "Zambia" },
    "Dhaka North": { lat: 23.8103, lng: 90.4125, country: "Bangladesh" },
    "Patna Rural": { lat: 25.5941, lng: 85.1376, country: "India" },
    "Lima Periphery": { lat: -12.0464, lng: -77.0428, country: "Peru" }
  },

  foods: [
    { id: "beans", name: "Beans", nutrients: ["protein", "iron", "folate"], cost: 1.2, score: 82 },
    { id: "lentils", name: "Lentils", nutrients: ["protein", "iron"], cost: 1.1, score: 85 },
    { id: "eggs", name: "Eggs", nutrients: ["protein", "vitaminB12", "fat"], cost: 1.8, score: 79 },
    { id: "milk", name: "Milk", nutrients: ["protein", "calcium", "fat"], cost: 1.5, score: 72 },
    { id: "yogurt", name: "Yogurt", nutrients: ["protein", "calcium"], cost: 1.4, score: 70 },
    { id: "sardines", name: "Sardines", nutrients: ["protein", "omega3", "calcium"], cost: 2.2, score: 88 },
    { id: "chicken_liver", name: "Chicken liver", nutrients: ["iron", "vitaminA", "protein"], cost: 2.0, score: 91 },
    { id: "millet", name: "Millet", nutrients: ["fiber", "iron", "carbs"], cost: 0.8, score: 76 },
    { id: "maize", name: "Maize", nutrients: ["carbs", "fiber"], cost: 0.6, score: 60 },
    { id: "rice", name: "Rice", nutrients: ["carbs"], cost: 0.9, score: 58 },
    { id: "sweet_potato", name: "Sweet potato", nutrients: ["vitaminA", "carbs", "fiber"], cost: 0.7, score: 78 },
    { id: "cassava", name: "Cassava", nutrients: ["carbs"], cost: 0.7, score: 55 },
    { id: "groundnuts", name: "Groundnuts", nutrients: ["protein", "fat", "zinc"], cost: 1.0, score: 74 },
    { id: "spinach", name: "Spinach", nutrients: ["iron", "folate", "vitaminA"], cost: 0.9, score: 81 },
    { id: "kale", name: "Kale", nutrients: ["iron", "vitaminA", "fiber"], cost: 0.8, score: 80 },
    { id: "moringa", name: "Moringa leaves", nutrients: ["iron", "vitaminA", "protein"], cost: 0.9, score: 89 },
    { id: "banana", name: "Banana", nutrients: ["potassium", "carbs"], cost: 0.6, score: 65 },
    { id: "mango", name: "Mango", nutrients: ["vitaminA", "vitaminC"], cost: 1.0, score: 73 },
    { id: "orange", name: "Orange", nutrients: ["vitaminC", "fiber"], cost: 0.8, score: 68 },
    { id: "fortified_flour", name: "Fortified flour", nutrients: ["iron", "folate", "carbs"], cost: 1.2, score: 77 }
  ],

  resources: [
    {
      id: "res-01",
      name: "Community Health Post A",
      type: "Clinic",
      lat: -1.296,
      lng: 36.817,
      services: ["MUAC screening", "Therapeutic feeding", "Maternal counseling"],
      open: "Mon-Sat 08:00-17:00"
    },
    {
      id: "res-02",
      name: "Hope Food Bank",
      type: "Food Support",
      lat: -1.287,
      lng: 36.83,
      services: ["Fortified flour", "Beans", "Voucher support"],
      open: "Mon-Fri 09:00-16:00"
    },
    {
      id: "res-03",
      name: "Mother & Child Nutrition Desk",
      type: "NGO",
      lat: -1.305,
      lng: 36.812,
      services: ["Breastfeeding support", "Micronutrient counseling"],
      open: "Daily 09:00-18:00"
    },
    {
      id: "res-04",
      name: "City Nutrition Center",
      type: "Clinic",
      lat: 0.35,
      lng: 32.585,
      services: ["Acute malnutrition treatment", "Growth monitoring"],
      open: "Mon-Sat 08:00-17:00"
    },
    {
      id: "res-05",
      name: "Rapid Relief Distribution Point",
      type: "Food Support",
      lat: 23.808,
      lng: 90.41,
      services: ["Rations", "Cash assistance"],
      open: "Mon-Fri 10:00-15:00"
    },
    {
      id: "res-06",
      name: "Rural Care Mobile Unit",
      type: "NGO",
      lat: 25.6,
      lng: 85.143,
      services: ["Weekly outreach", "Child triage"],
      open: "Tue/Thu/Sat 08:00-14:00"
    }
  ],

  lessons: [
    {
      id: "lesson-1",
      title: "Balanced Plate in 5 Minutes",
      level: "Beginner",
      content: "Combine one energy food, one body-building food, and one protective food in each meal.",
      quickTip: "Example: maize + beans + spinach"
    },
    {
      id: "lesson-2",
      title: "Spotting Early Warning Signs",
      level: "Essential",
      content: "Watch for reduced appetite, visible wasting, repeated diarrhea, and low activity levels.",
      quickTip: "If severe edema or lethargy appears, refer immediately"
    },
    {
      id: "lesson-3",
      title: "Affordable Iron Boosters",
      level: "Intermediate",
      content: "Use lentils, moringa, spinach, and small fish with vitamin C foods for better iron absorption.",
      quickTip: "Pair lentils with orange or mango"
    }
  ]
};
