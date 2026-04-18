import React, { useState } from 'react'
import { useEffect } from 'react'

interface MenuItem {
  category: string
  name: string
  price: string
  desc: string
  tag: string
}

const Chocolate = () => {
  const [activeTab, setActiveTab] = useState<string>('all')

  const dummy_response = {
    hero: {
      heading: "A taste of Lisbon on your doorstep",
      description: "Freshly baked pastries, artisan coffee, and authentic savoury treats — handmade every morning with love, tradition, and imported ingredients straight from Portugal.",
      image: "hero.jpg",
      tag: "Bromley's Portuguese & Brazilian patisserie",
      name: "Sweet Paradise",
      highlights: [
        "Freshly baked daily",
        "Imported ingredients",
        "Authentic Portuguese taste",
        "Freshly baked daily",
        "Imported ingredients",
        "Authentic Portuguese taste"
      ]
    },
    menu: {
      tag: "OUR MENU",
      heading: "Made fresh, every single day",
      description: "Everything on our menu is prepared by hand on the premises each morning. No preservatives, no shortcuts — just real food made with passion."
    },
    ourStory: {
      tag: "OUR STORY",
      heading: "Made with roots, served with heart",
      description: "We started our journey in 1990 with a simple mission: to create the finest chocolates using traditional recipes and the highest quality ingredients. We started our journey in 1990 with a simple mission: to create the finest chocolates using traditional recipes and the highest quality ingredients.",
      highlights: [
        "Freshly baked daily",
        "Imported ingredients",
        "Authentic Portuguese taste",
        "Freshly baked daily",
        "Imported ingredients",
        "Authentic Portuguese taste"
      ]
    },
    reviews: {
      tag: "WHAT PEOPLE SAY",
      heading: "Loved by our neighbours",
      description: "Loved by thousands of happy customers Loved by thousands of happy customers Loved by thousands of happy customers Loved by thousands of happy customers "
    },
    address: {
      tag: "GET IN TOUCH",
      heading: "Visit Us Or Place an Order",
      description: "Whether you're popping in for a coffee, planning a birthday cake, or need catering for an event — we'd love to hear from you.",
      address: "Rourkela, Odisha, India",
      phone: "9876543210",
      email: "shop@email.com",
      instagram: "https://instagram.com/shop"
    },
    footer: {
      footerText: "Thank you for visiting our store",
      copyright: "© 2026 Sweet Shop",
      facebook: "https://facebook.com/shop",
      instagram: "https://instagram.com/shop",
      twitter: "https://twitter.com/shop"
    },
    timings: {
      mondayOpen: "16:00", mondayClose: "21:00",
      tuesdayOpen: "16:00", tuesdayClose: "21:00",
      wednesdayOpen: "16:00", wednesdayClose: "21:00",
      thursdayOpen: "16:00", thursdayClose: "21:00",
      fridayOpen: "16:00", fridayClose: "22:00",
      saturdayOpen: "14:00", saturdayClose: "22:00",
      sundayOpen: "14:00", sundayClose: "20:00"
    }
  }

  const [response, setResponse] = useState(dummy_response)

  useEffect(() => {
    const stored = localStorage.getItem("response")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setResponse(dummy_response)
      } catch {
        setResponse(dummy_response)
      }
    } else {
      setResponse(dummy_response)
    }
  }, [])

  // Hardcoded menu items
  const menuItems: {
    [key: string]: MenuItem[]
  } = {
    all: [
      { category: "Chocolates", name: "Dark Chocolate Truffle", price: "£4.50", desc: "Rich 70% dark chocolate ganache rolled in cocoa powder", tag: "Bestseller" },
      { category: "Chocolates", name: "Caramel Sea Salt", price: "£4.50", desc: "Smooth caramel with a hint of sea salt", tag: "" },
      { category: "Gifts", name: "Signature Gift Box", price: "£25", desc: "12 assorted chocolates in a luxury gift box", tag: "Perfect for gifting" },
      { category: "Drinks", name: "Signature Hot Chocolate", price: "£4.20", desc: "Rich, creamy hot chocolate made with Belgian chocolate", tag: "" }
    ],
    chocolates: [],
    gifts: [],
    drinks: [],
    specials: []
  }

  menuItems.chocolates = menuItems.all.filter(item => item.category === "Chocolates")
  menuItems.gifts = menuItems.all.filter(item => item.category === "Gifts")
  menuItems.drinks = menuItems.all.filter(item => item.category === "Drinks")
  menuItems.specials = menuItems.all.filter(item => item.category === "Specials")

  const getCurrentItems = (): MenuItem[] => {
    if (activeTab === 'all') return menuItems.all
    if (activeTab === 'chocolates') return menuItems.chocolates
    if (activeTab === 'gifts') return menuItems.gifts
    if (activeTab === 'drinks') return menuItems.drinks
    if (activeTab === 'specials') return menuItems.specials
    return menuItems.all
  }

  const reviews = [
    { text: "Absolutely the best chocolates I've ever had. The quality is unmatched.", author: "Priya S.", stars: 5 },
    { text: "Ordered the gift box for my wife's birthday. She loved it!", author: "Rahul M.", stars: 5 },
    { text: "Their hot chocolate is incredible. Will definitely order again.", author: "Neha K.", stars: 5 }
  ]

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        html { scroll-behavior: smooth; }
        /* Infinite marquee animation */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          display: flex;
          width: max-content;
        }
        .marquee-container:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>

      {/* HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] min-h-[88vh] bg-[#FAF7F2]">
        <div className="px-4 md:px-12 py-12 md:py-20 lg:py-24 flex flex-col justify-center">
          <div className='flex flex-row gap-5 items-center'>
            <p className='h-[2px] w-[20px] bg-[#b64826]' />
            <p className='uppercase text-[#b74d2d] text-sm tracking-widest'>{response.hero.tag}</p>
          </div>
          <h1 className="font-['Playfair_Display',serif] text-4xl md:text-5xl lg:text-6xl text-[#3D1F0A] mb-6 leading-tight tracking-tight">
            {response.hero.heading}
          </h1>
          <p className="text-[#7A5C48] text-base md:text-lg leading-relaxed max-w-md mb-8 md:mb-10 font-light">
            {response.hero.description}
          </p>
          <div className="flex gap-4 flex-wrap">
            <a href="#menu" className="bg-cyan-500 text-white px-5 md:px-7 py-3 rounded-lg font-medium hover:bg-cyan-800 transition text-center">🛵 Order on Deliverdoo</a>
            <a href="#contact" className="border-2 border-[#C8502A] text-[#8B3418] px-5 md:px-7 py-3 rounded-lg font-medium hover:bg-[#FDF4EF] transition text-center">Contact us</a>
          </div>
        </div>
        <div className="bg-[#F5E6DC] flex items-center justify-center p-6 md:p-12">
          <div className="bg-[#FDF4EF] rounded-2xl border border-[rgba(140,80,40,0.15)] w-full aspect-[4/5] flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl md:text-8xl block mb-4">🍫</span>
              <div className="font-['Playfair_Display',serif] text-[#8B3418] italic">Handcrafted<br />with love</div>
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS - Infinite sliding marquee */}
      <div className="w-full bg-[#b64826] py-4 md:py-5 overflow-hidden marquee-container">
        <div className="animate-marquee whitespace-nowrap">
          {[...response.hero.highlights, ...response.hero.highlights].map((item, index) => (
            <span key={index} className="font-['Playfair_Display',serif] text-[#F5E6DC] text-sm md:text-base mx-6 md:mx-10 inline-block">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* MENU SECTION */}
      <section id="menu" className="px-4 md:px-12 py-16 md:py-24 bg-[#FAF7F2]">
        <div className='flex flex-row gap-5 items-center'>
          <p className='h-[2px] w-[20px] bg-[#b64826]' />
          <p className='uppercase text-[#b74d2d] text-sm tracking-widest'>{response.menu.tag}</p>
        </div>
        <h2 className="font-['Playfair_Display',serif] text-3xl md:text-4xl text-[#3D1F0A] font-bold mb-3 tracking-tight">{response.menu.heading}</h2>
        <p className="text-[#7A5C48] text-sm md:text-base max-w-md mb-8 md:mb-12 font-light">{response.menu.description}</p>

        {/* TABS - overflow auto no wrap */}
        <div className="overflow-x-auto whitespace-nowrap flex flex-nowrap gap-2 mb-8 md:mb-9 pb-2">
          {[
            { id: 'all', label: 'All items' },
            { id: 'chocolates', label: 'Chocolates' },
            { id: 'gifts', label: 'Gift Boxes' },
            { id: 'drinks', label: 'Drinks' },
            { id: 'specials', label: 'Specials' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-[13px] font-medium border transition flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#C8502A] text-white border-[#C8502A]'
                  : 'bg-white text-[#7A5C48] border-[rgba(140,80,40,0.15)] hover:bg-[#C8502A] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>


        

{/* MENU GRID - responsive: 1/2/3 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
  {getCurrentItems().map((item, idx) => (
    <div key={idx} className="relative h-60  rounded-sm overflow-hidden shadow-sm hover:shadow-md transition group">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: 'url("/cake-img.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Gradient overlay - dark at bottom, lighter at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
      </div>
      
      {/* Content positioned at bottom of image */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="font-['Playfair_Display',serif] text-white text-lg md:text-xl font-semibold">{item.name}</div>
          <div className="text-[#FFA07A] font-medium whitespace-nowrap">{item.price}</div>
        </div>
        <div className="text-white/90 text-sm md:text-[15px] leading-relaxed font-light mb-3">{item.desc}</div>
        {item.tag && (
          <span className="inline-block text-xs bg-[#C8502A]/90 text-white px-3 py-1 rounded-full font-medium backdrop-blur-sm">
            {item.tag}
          </span>
        )}
      </div>
    </div>
  ))}
</div>
      </section>

      {/* OUR STORY + HOURS */}
      <section id="story" className="px-4 md:px-12 py-16 md:py-24 bg-[#FDF4EF]">
        <div className='flex flex-row gap-5 items-center'>
          <p className='h-[2px] w-[20px] bg-[#b64826]' />
          <p className='uppercase text-[#b74d2d] text-sm tracking-widest'>{response.ourStory.tag}</p>
        </div>
        <h2 className="font-['Playfair_Display',serif] text-3xl md:text-4xl text-[#3D1F0A] mb-3 tracking-tight">{response.ourStory.heading}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 mt-6">
          <div>
            <p className="text-[#7A5C48] text-sm md:text-[15px] leading-relaxed font-light mb-4">
              {response.ourStory.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {(response.ourStory?.highlights || []).map((item, i) => (
                <span key={i} className="px-3 py-1 text-xs bg-[#F3E2D8] text-[#B74D2D] rounded-full border border-[rgba(183,77,45,0.2)]">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[rgba(140,80,40,0.15)] overflow-hidden">
            <div className="bg-[#C8502A] px-5 md:px-6 py-4 md:py-5 text-white font-['Playfair_Display',serif] text-base md:text-lg">Opening hours</div>
            <div className="px-4 md:px-6">
              {[
                { day: "Monday", open: response.timings.mondayOpen, close: response.timings.mondayClose },
                { day: "Tuesday", open: response.timings.tuesdayOpen, close: response.timings.tuesdayClose },
                { day: "Wednesday", open: response.timings.wednesdayOpen, close: response.timings.wednesdayClose },
                { day: "Thursday", open: response.timings.thursdayOpen, close: response.timings.thursdayClose },
                { day: "Friday", open: response.timings.fridayOpen, close: response.timings.fridayClose },
                { day: "Saturday", open: response.timings.saturdayOpen, close: response.timings.saturdayClose },
                { day: "Sunday", open: response.timings.sundayOpen, close: response.timings.sundayClose }
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-[rgba(140,80,40,0.15)] text-xs md:text-[14px]">
                  <span className="text-[#7A5C48] font-light">{item.day}</span>
                  <span className="text-[#3D1F0A] font-medium">{item.open} – {item.close}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section id="reviews" className="px-4 md:px-12 py-16 md:py-24 bg-[#FAF7F2]">
        <div className='flex flex-row gap-5 items-center'>
          <p className='h-[2px] w-[20px] bg-[#b64826]' />
          <p className='uppercase text-[#b74d2d] text-sm tracking-widest'>{response.reviews.tag}</p>
        </div>
        <h2 className="font-['Playfair_Display',serif] text-3xl md:text-4xl text-[#3D1F0A] mb-3 tracking-tight">{response.reviews.heading}</h2>
        <p className="text-[#7A5C48] text-sm md:text-base max-w-md mb-8 md:mb-12 font-light">{response.reviews.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white border border-[rgba(140,80,40,0.15)] rounded-xl p-5 md:p-6">
              <div className="text-3xl md:text-4xl text-[#F5E6DC] font-['Playfair_Display',serif] leading-none mb-2">"</div>
              <div className="text-xs md:text-[14px] text-[#7A5C48] italic leading-relaxed font-light mb-4">{review.text}</div>
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-[13px] font-medium text-[#3D1F0A]">{review.author}</span>
                <span className="text-[#C9973A] text-xs md:text-[13px]">{"★".repeat(review.stars)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="px-4 md:px-12 py-16 md:py-24 bg-[#FDF4EF]">
        <div className='flex flex-row gap-5 items-center'>
          <p className='h-[2px] w-[20px] bg-[#b64826]' />
          <p className='uppercase text-[#b74d2d] text-sm tracking-widest'>{response.address.tag}</p>
        </div>
        <h2 className="font-['Playfair_Display',serif] text-3xl md:text-4xl text-[#3D1F0A] mb-3 tracking-tight">{response.address.heading}</h2>
        <p className="text-[#7A5C48] text-sm md:text-base max-w-md mb-8 md:mb-12 font-light">{response.address.description}</p>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 md:gap-16">
          <div className="space-y-5 md:space-y-7">
            <div className="flex gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#C8502A] rounded-lg flex items-center justify-center text-white text-base md:text-lg">📍</div>
              <div><strong className="text-xs md:text-[14px] text-[#3D1F0A] block mb-1">Address</strong><p className="text-xs md:text-[14px] text-[#7A5C48] font-light">{response.address.address}</p></div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#C8502A] rounded-lg flex items-center justify-center text-white text-base md:text-lg">📞</div>
              <div><strong className="text-xs md:text-[14px] text-[#3D1F0A] block mb-1">Phone</strong><p className="text-xs md:text-[14px] text-[#7A5C48] font-light">{response.address.phone}</p></div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#C8502A] rounded-lg flex items-center justify-center text-white text-base md:text-lg">📧</div>
              <div><strong className="text-xs md:text-[14px] text-[#3D1F0A] block mb-1">Email</strong><p className="text-xs md:text-[14px] text-[#7A5C48] font-light">{response.address.email}</p></div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#C8502A] rounded-lg flex items-center justify-center text-white text-base md:text-lg">📸</div>
              <div><strong className="text-xs md:text-[14px] text-[#3D1F0A] block mb-1">Instagram</strong><p className="text-xs md:text-[14px] text-[#7A5C48] font-light">@{response.address.instagram.split('/').pop()}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 md:p-9 border border-[rgba(140,80,40,0.15)]">
            <div className="font-['Playfair_Display',serif] text-xl md:text-2xl text-[#3D1F0A] mb-4 md:mb-6">Send us a message</div>
            <div className="space-y-3 md:space-y-4">
              <div><label className="block text-[10px] md:text-[11px] font-medium text-[#7A5C48] uppercase tracking-wide mb-2">Your name</label><input type="text" className="w-full p-2 md:p-3 border-2 border-[rgba(140,80,40,0.15)] rounded-lg bg-[#FAF7F2] focus:border-[#C8502A] focus:bg-white outline-none transition text-sm" /></div>
              <div><label className="block text-[10px] md:text-[11px] font-medium text-[#7A5C48] uppercase tracking-wide mb-2">Email address</label><input type="email" className="w-full p-2 md:p-3 border-2 border-[rgba(140,80,40,0.15)] rounded-lg bg-[#FAF7F2] focus:border-[#C8502A] focus:bg-white outline-none transition text-sm" /></div>
              <div><label className="block text-[10px] md:text-[11px] font-medium text-[#7A5C48] uppercase tracking-wide mb-2">Enquiry type</label><select className="w-full p-2 md:p-3 border-2 border-[rgba(140,80,40,0.15)] rounded-lg bg-[#FAF7F2] focus:border-[#C8502A] focus:bg-white outline-none transition text-sm"><option>General enquiry</option><option>Birthday cake order</option><option>Corporate gifting</option></select></div>
              <div><label className="block text-[10px] md:text-[11px] font-medium text-[#7A5C48] uppercase tracking-wide mb-2">Your message</label><textarea rows={3} className="w-full p-2 md:p-3 border-2 border-[rgba(140,80,40,0.15)] rounded-lg bg-[#FAF7F2] focus:border-[#C8502A] focus:bg-white outline-none transition text-sm"></textarea></div>
              <button className="w-full bg-[#C8502A] text-white py-3 md:py-4 rounded-lg font-medium hover:bg-[#8B3418] transition text-sm md:text-base">Send message →</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#3D1F0A] px-4 md:px-12 py-10 md:py-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        <div>
          <div className="font-['Playfair_Display',serif] text-xl md:text-2xl text-[#F5E6DC] mb-2">{response.hero.name}</div>
          <div className="text-[10px] md:text-[12px] text-white/40 tracking-wider uppercase font-light">{response.hero.description}</div>
        </div>
        <div>
          <div className="text-[10px] md:text-[11px] font-medium tracking-wider uppercase text-[#C8502A] mb-4">Visit us</div>
          <ul className="space-y-2">
            <li className="text-xs md:text-[14px] text-white/50 font-light">{response.address.address}</li>
            <li className="text-xs md:text-[14px] text-white/50 font-light">{response.address.phone}</li>
            <li className="text-xs md:text-[14px] text-white/50 font-light">{response.address.email}</li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] md:text-[11px] font-medium tracking-wider uppercase text-[#C8502A] mb-4">Follow us</div>
          <ul className="space-y-2">
            <li className="text-xs md:text-[14px] text-white/50 font-light">Instagram: @sweetshop</li>
            <li className="text-xs md:text-[14px] text-white/50 font-light">Facebook: /sweetshop</li>
          </ul>
        </div>
      </footer>
      <div className="bg-[#3D1F0A] px-4 md:px-12 py-3 md:py-4 border-t border-white/10 text-center text-[10px] md:text-[12px] text-white/30 font-light">
        {response.footer.copyright}
      </div>
    </div>
  )
}

export default Chocolate