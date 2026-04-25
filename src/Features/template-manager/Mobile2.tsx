import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const dummyResponse = {
  hero: {
    tag: "PREMIUM TECH ACCESSORIES",
    heading: "Power up your daily drive",
    description:
      "Minimal design, maximum performance. Discover charging gear, audio essentials, and protective cases crafted for the modern lifestyle.",
    image:
      "https://images.unsplash.com/photo-1590901846539-999905494d45?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "VoltCase",
    highlights: [
      "Fast charging certified",
      "Sweat-proof & durable",
      "1-year warranty",
      "Eco-friendly packaging",
      "24/7 support",
      "Trusted by 20k+ users",
    ],
  },
  story: {
    tag: "OUR STORY",
    heading: "Built for the restless",
    description:
      "We started VoltCase with a simple belief: your gear should work as hard as you do. In 2020, we set out to create mobile accessories that combine minimalist design with cutting-edge reliability. No gimmicks, just real-world performance. Every cable, case, and charger is tested to survive coffee spills, tangled bags, and daily chaos — because technology should empower, not frustrate.",
    highlights: [
      "Wireless Future Lab",
      "Recycled materials",
      "Engineered in Berlin",
      "24-month warranty",
      "Fast shipping worldwide",
      "Carbon-neutral shipping",
    ],
  },
  reviews: {
    tag: "TESTIMONIALS",
    heading: "Trusted by thousands",
    description: "Real feedback from customers who made the switch.",
    list: [
      {
        text: "The best braided cable I've ever owned. Zero tangles, and it charges my laptop too!",
        author: "Google User",
        rating: 5,
      },
      {
        text: "Earphones have incredible battery life. The case fits perfectly in my jean pocket.",
        author: "Google User",
        rating: 5,
      },
      {
        text: "Finally a power bank that doesn't feel like a brick. Sleek and fast.",
        author: "Google User",
        rating: 5,
      },
    ],
  },
  address: {
    tag: "VISIT & CONNECT",
    heading: "We're here to help",
    description:
      "Questions about compatibility? Need a bulk order? Our team replies within 2 hours.",
    address: "22b Soho Street, London W1D 3QN, United Kingdom",
    phone: "+44 7700 900123",
    email: "hello@voltcase.com",
    instagram: "https://instagram.com/voltcase",
  },
  footer: {
    footerText: "Stay powered, stay seamless",
    copyright: "© 2026 VoltCase — Modern mobile essentials",
    instagram: "https://instagram.com/voltcase",
    twitter: "https://twitter.com/voltcase",
  },
  timings: {
    mondayOpen: "9:00 am",
    mondayClose: "6:00 pm",
    tuesdayOpen: "9:00 am",
    tuesdayClose: "6:00 pm",
    wednesdayOpen: "9:00 am",
    wednesdayClose: "6:00 pm",
    thursdayOpen: "9:00 am",
    thursdayClose: "6:00 pm",
    fridayOpen: "9:00 am",
    fridayClose: "6:00 pm",
    saturdayOpen: "10:00 am",
    saturdayClose: "5:00 pm",
    sundayOpen: "11:00 am",
    sundayClose: "4:00 pm",
  },
}

const mockProducts = [
  {
    id: "p1",
    name: "65W USB-C Charger",
    price: "£49",
    description:
      "Ultra-compact, charges MacBook, iPad, and phone simultaneously.",
    image:
      "https://images.unsplash.com/photo-1731616103600-3fe7ccdc5a59?w=600&auto=format",
    tag: "Bestseller",
    category: "chargers",
  },
  {
    id: "p2",
    name: "Wireless headphones",
    price: "£89",
    description:
      "30h battery, IPX5 sweat resistance, spatial audio support.",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format",
    tag: "New",
    category: "audio",
  },
  {
    id: "p3",
    name: "MagSafe Clear Case (iPhone 15)",
    price: "£35",
    description:
      "20% recycled silicone, raised edges, never yellows.",
    image:
      "https://images.unsplash.com/photo-1605000977407-2771f2f8e908?w=600&auto=format",
    tag: "",
    category: "cases",
  },
  {
    id: "p4",
    name: "Slim 10,000mAh Power Bank",
    price: "£39",
    description:
      "Built-in USB-C cable, digital display, pass-through charging.",
    image:
      "https://plus.unsplash.com/premium_photo-1671103732255-24d3e813f2dd?w=600&auto=format",
    tag: "Eco edition",
    category: "power",
  },
  {
    id: "p5",
    name: "Braided USB-C to C Cable (2m)",
    price: "£19",
    description:
      "Nylon braided, 100W fast charge, tangle-free design.",
    image:
      "https://images.unsplash.com/photo-1596570689888-52906bdd68a9?w=600&auto=format",
    tag: "",
    category: "chargers",
  },
  {
    id: "p6",
    name: "Active Noise Cancelling Headphones",
    price: "£149",
    description:
      "Adaptive ANC, 40h playback, memory foam ear cups.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format",
    tag: "Limited",
    category: "audio",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const TypewriterHeading = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("")
  const [index, setIndex] = useState(0)

  React.useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[index])
        setIndex(index + 1)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [index, text])

  return (
    <motion.h1
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6"
    >
      {displayText}
      <span className="animate-pulse">|</span>
    </motion.h1>
  )
}

const ProductCard = ({ product }: { product: any }) => {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      className="group bg-gray-900 rounded-xl border border-gray-800 overflow-hidden transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        {product.tag && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-2 py-1 rounded-full shadow-sm z-10">
            {product.tag}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-semibold text-white text-lg">
              {product.name}
            </h3>
            <span className="text-white font-bold text-xl">
              {product.price}
            </span>
          </div>
          <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

const MobileAccessoriesStore = () => {
  const [activeFilter, setActiveFilter] = useState("all")

  const categories = ["all", ...new Set(mockProducts.map((p) => p.category))]
  const filteredProducts =
    activeFilter === "all"
      ? mockProducts
      : mockProducts.filter((p) => p.category === activeFilter)

  const categoryLabels: Record<string, string> = {
    all: "All",
    chargers: "Chargers & Cables",
    audio: "Headphones & Audio",
    cases: "Phone Cases",
    power: "Power Banks",
  }

  return (
    <div className="min-h-screen bg-black font-['Inter',system-ui,sans-serif] selection:bg-blue-600/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          display: flex;
          width: max-content;
        }
        .marquee-container:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>

      <section className="relative h-screen w-full overflow-hidden">
        <img
          src={dummyResponse.hero.image}
          className="absolute inset-0 w-full h-full object-cover"
          alt="hero"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-5 md:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-blue-500" />
              <span className="uppercase text-blue-400 text-xs font-semibold tracking-wider">
                {dummyResponse.hero.tag}
              </span>
            </div>
            <TypewriterHeading text={dummyResponse.hero.heading} />
            <p className="text-gray-300 text-lg max-w-lg mb-8">
              {dummyResponse.hero.description}
            </p>
            <div className="flex gap-4">
              <a
                href="#products"
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-500 transition"
              >
                Shop now →
              </a>
              <a
                href="#contact"
                className="border border-gray-500 text-gray-200 px-6 py-3 rounded-full font-semibold hover:border-blue-400 hover:text-blue-400 transition"
              >
                Contact team
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6 max-w-md mt-12 pt-6 border-t border-gray-700">
              <div>
                <p className="text-2xl font-bold text-white">4.9★</p>
                <p className="text-gray-400 text-xs">Google rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">20k+</p>
                <p className="text-gray-400 text-xs">Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Free</p>
                <p className="text-gray-400 text-xs">UK delivery over £30</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="bg-gray-950 py-3 overflow-hidden border-y border-gray-800 marquee-container">
        <div className="animate-marquee whitespace-nowrap flex gap-8 w-max">
          {[...dummyResponse.hero.highlights, ...dummyResponse.hero.highlights].map(
            (item, i) => (
              <span
                key={i}
                className="text-gray-400 text-sm inline-flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {item}
              </span>
            )
          )}
        </div>
      </div>

      <motion.section
        id="products"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="py-20 px-5 md:px-8 max-w-7xl mx-auto"
      >
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-blue-500" />
            <span className="uppercase text-blue-400 text-xs font-semibold">
              Our top picks
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Engineered for everyday
          </h2>
          <p className="text-gray-400 mb-8">
            Charging, audio, and protection — all tested to survive real life.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                activeFilter === cat
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-900 text-gray-300 border border-gray-700 hover:border-blue-500"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="py-20 bg-gray-950/40 px-5 md:px-8 max-w-7xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-blue-500" />
              <span className="uppercase text-blue-400 text-xs">
                {dummyResponse.story.tag}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {dummyResponse.story.heading}
            </h2>
            <p className="text-gray-400 mb-6">
              {dummyResponse.story.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {dummyResponse.story.highlights.map((h, i) => (
                <span
                  key={i}
                  className="bg-gray-900 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-800"
                >
                  {h}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="bg-gray-950 rounded-xl border border-gray-800 p-5">
              <h3 className="font-semibold text-gray-300 text-sm mb-3">
                ⏰ Opening hours
              </h3>
              <div className="divide-y divide-gray-800">
                {Object.entries(dummyResponse.timings).map(([key, val], idx) => {
                  if (key.includes("Close")) return null
                  const day = key.replace("Open", "")
                  const closeKey = key.replace("Open", "Close")
                  return (
                    <div key={idx} className="flex justify-between py-2 text-sm">
                      <span className="text-gray-500">{day}</span>
                      <span className="text-gray-200">
                        {val} – {dummyResponse.timings[closeKey]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="py-20 px-5 md:px-8 max-w-7xl mx-auto"
      >
        <div className="flex flex-wrap justify-between items-end gap-6 mb-12">
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-blue-500" />
              <span className="uppercase text-blue-400 text-xs">
                {dummyResponse.reviews.tag}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {dummyResponse.reviews.heading}
            </h2>
            <p className="text-gray-400 mt-2">
              {dummyResponse.reviews.description}
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="bg-gray-950 rounded-xl px-6 py-4 text-center border border-gray-800"
          >
            <p className="text-4xl font-bold text-white">4.9</p>
            <div className="text-amber-400">★★★★★</div>
            <p className="text-gray-500 text-xs">1,200+ reviews</p>
          </motion.div>
        </div>

        <motion.div
          variants={stagger}
          className="grid md:grid-cols-3 gap-6"
        >
          {dummyResponse.reviews.list.map((rev, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="bg-gray-950 rounded-xl p-5 border border-gray-800"
            >
              <div className="text-4xl text-gray-800">"</div>
              <p className="text-gray-300 text-sm mb-4">{rev.text}</p>
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">{rev.author}</span>
                <span className="text-amber-400 text-xs">
                  {"★".repeat(rev.rating)}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="contact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="py-20 bg-gray-950/30 px-5 md:px-8 max-w-7xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-blue-500" />
              <span className="uppercase text-blue-400 text-xs">
                {dummyResponse.address.tag}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {dummyResponse.address.heading}
            </h2>
            <p className="text-gray-400 mb-6">
              {dummyResponse.address.description}
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-300 text-sm font-semibold">📍 Visit</h3>
                <p className="text-gray-400">{dummyResponse.address.address}</p>
              </div>
              <div>
                <h3 className="text-gray-300 text-sm font-semibold">📞 Contact</h3>
                <p className="text-gray-400">
                  {dummyResponse.address.phone}
                  <br />
                  {dummyResponse.address.email}
                </p>
              </div>
              <div>
                <h3 className="text-gray-300 text-sm font-semibold">📸 Social</h3>
                <a
                  href={dummyResponse.address.instagram}
                  className="text-blue-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @voltcase
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-gray-950 rounded-xl p-6 border border-gray-800"
          >
            <h3 className="text-xl font-semibold text-white mb-5">
              Send a message
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                <option>Product support</option>
                <option>Wholesale</option>
                <option>Order status</option>
              </select>
              <textarea
                rows={3}
                placeholder="Message"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
              <button className="w-full bg-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-500 transition">
                Send →
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

            <footer className="bg-gray-900 text-white pt-14 pb-6">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="font-semibold text-xl tracking-tight mb-2">{dummyResponse.hero.name}</div>
              <p className="text-gray-400 text-sm">{dummyResponse.footer.footerText}</p>
            </div>
            <div>
              <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Visit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href={`https://maps.google.com/?q=${encodeURIComponent(dummyResponse.address.address)}`} target="_blank" className="text-gray-300 hover:text-white transition">{dummyResponse.address.address}</a></li>
                <li><a href={`tel:${dummyResponse.address.phone}`} className="text-gray-300 hover:text-white transition">{dummyResponse.address.phone}</a></li>
                <li><a href={`mailto:${dummyResponse.address.email}`} className="text-gray-300 hover:text-white transition">{dummyResponse.address.email}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Follow</h4>
              <ul className="space-y-2 text-sm">
                <li><a href={dummyResponse.footer.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">Instagram</a></li>
                <li><a href={dummyResponse.footer.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">X / Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-xs">
            {dummyResponse.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MobileAccessoriesStore