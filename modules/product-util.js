const productModel = require("../models/productModel");

/*const products = [
  {
    title: "One Piece Gol D. Roger Figurine",
    description:
      "A high-quality collectible figurine of the legendary pirate Gol D. Roger from One Piece.",
    category: "Merch & Collectibles",
    price: 14.99,
    salePrice: 9.99,
    shippingWeight: 2.5,
    shippingWidth: 25,
    shippingLength: 20,
    shippingHeight: 30,
    imageUrl: "male-3709694_1280.jpg",
    featured: true,
  },
  {
    title: "Star Trek Original Series Replica Communicator",
    description:
      "A detailed replica of the communicator from the classic Star Trek Original Series, complete with sound effects.",
    category: "Merch & Collectibles",
    price: 69.99,
    salePrice: 59.99,
    shippingWeight: 1.2,
    shippingWidth: 15,
    shippingLength: 10,
    shippingHeight: 5,
    imageUrl: "stefan-cosma-qa9EuWPsgFU-unsplash.jpg",
    featured: true,
  },
  {
    title: "AKIRA Otomo Katsuhiro Complete Manga Set",
    description:
      "The full AKIRA manga collection by Katsuhiro Otomo, a must-have for cyberpunk and manga fans.",
    category: "Comics & Manga",
    price: 149.99,
    salePrice: 99.99,
    shippingWeight: 6.0,
    shippingWidth: 30,
    shippingLength: 25,
    shippingHeight: 20,
    imageUrl: "comic-4925345_1280.jpg",
    featured: true,
  },
  {
    title: "Yu-Gi-Oh! Harpie Lady Sisters Maximum Summon",
    description:
      "Special 'Harpie Lady Sisters' cards for the 'Rush Duels' format from the 2023 Triple Build Pack: Godbreath Wing.",
    category: "Merch & Collectibles",
    price: 29.99,
    salePrice: 29.99,
    shippingWeight: 0.1,
    shippingWidth: 10,
    shippingLength: 10,
    shippingHeight: 1,
    imageUrl: "jovan-vasiljevic-U5uujWVegek-unsplash.jpg",
    featured: false,
  },
  {
    title: "Nintendo NES Mini",
    description:
      "The original look and feel of the Nintendo Classic Edition, redesigned miniature version, smaller, sleeker, and preloaded with 30 innovative games, HDMI cable, AC adapter, and the NES Classic Mini Controller.",
    category: "Retro Games & Consoles",
    price: 99.99,
    salePrice: 99.99,
    shippingWeight: 0.5,
    shippingWidth: 20,
    shippingLength: 15,
    shippingHeight: 10,
    imageUrl: "ravi-palwe-vXSKAIfaIwY-unsplash.jpg",
    featured: false,
  },
  {
    title: "Naruto Kakashi Figurine – Chidori",
    description:
      "A highly detailed Kakashi figurine captured in the iconic Chidori pose, showcasing his legendary jutsu with vibrant lightning effects.",
    category: "Merch & Collectibles",
    price: 69.99,
    salePrice: 69.99,
    shippingWeight: 0.6,
    shippingWidth: 15,
    shippingLength: 15,
    shippingHeight: 25,
    imageUrl: "maha-khairy-3uuLWb6aQXc-unsplash.jpg",
    featured: false,
  },
  {
    title: "Action Comics #364 – Untouchable From Krypton!",
    description:
      "A classic Superman comic from June 1968 featuring the gripping story of the Man of Steel battling a microscopic virus and the threat of Kryptonian leprosy!",
    category: "Comics & Manga",
    price: 39.99,
    salePrice: 39.99,
    shippingWeight: 0.3,
    shippingWidth: 8,
    shippingLength: 11,
    shippingHeight: 0.2,
    imageUrl: "erik-mclean-ofodA2MvUFE-unsplash.jpg",
    featured: false,
  },
  {
    title: "Silver Surfer #1 (1968)",
    description:
      "A highly sought-after first issue of The Silver Surfer's solo series from August 1968. Written by Stan Lee and illustrated by John Buscema, this key Silver Age comic introduces the origin of Norrin Radd and Shalla-Bal.",
    category: "Comics & Manga",
    price: 999.99,
    salePrice: 799.99,
    shippingWeight: 0.3,
    shippingWidth: 8,
    shippingLength: 11,
    shippingHeight: 0.2,
    imageUrl: "jonathan-cooper-tnBG1dBsnUk-unsplash.jpg",
    featured: false,
  },
  {
    title: "Star Wars Stormtrooper",
    description:
      "A detailed costume of the iconic foot soldiers of the Galactic Empire.",
    category: "Cosplay & Costumes",
    price: 99.99,
    salePrice: 99.99,
    shippingWeight: 8.0,
    shippingWidth: 20,
    shippingLength: 20,
    shippingHeight: 30,
    imageUrl: "cody-board-ZjEnJRz3jbA-unsplash.jpg",
    featured: false,
  },
  {
    title: "Nintendo Game Boy Original DMG-01",
    description:
      "The classic Nintendo Game Boy DMG-01, a portable handheld gaming console that introduced portable gaming to the world in 1989. Games not included.",
    category: "Retro Games & Consoles",
    price: 149.99,
    salePrice: 149.99,
    shippingWeight: 0.3,
    shippingWidth: 15,
    shippingLength: 12,
    shippingHeight: 5,
    imageUrl: "lander-denys-J72jCU2HuAM-unsplash.jpg",
    featured: false,
  },
  {
    title: "Fumikage Tokoyami Cosplay",
    description:
      "A high-quality cosplay costume of Fumikage Tokoyami from My Hero Academia, featuring his signature bird mask and costume details.",
    category: "Cosplay & Costumes",
    price: 79.99,
    salePrice: 69.99,
    shippingWeight: 5.0,
    shippingWidth: 35,
    shippingLength: 30,
    shippingHeight: 15,
    imageUrl: "yogurt-AhIQcZwBnrs-unsplash.jpg",
    featured: false,
  },
];*/

module.exports.getAllProducts = function () {
  return productModel.find({});
};

module.exports.getFeaturedProducts = function () {
  return productModel.find({ featured: true });
};

module.exports.getProductsByCategory = function (products) {
  let categories = [];
  let result = [];

  products.forEach((product) => {
    if (!categories.includes(product.category)) {
      categories.push(product.category);
    }
  });

  categories.forEach((category) => {
    let categoryProducts = [];
    products.forEach((product) => {
      if (product.category === category) {
        categoryProducts.push(product);
      }
    });
    result.push({ category: category, products: categoryProducts });
  });

  return result;
};
