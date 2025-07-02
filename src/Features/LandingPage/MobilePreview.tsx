import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Instagram, Facebook, ChefHat, Utensils, Coffee, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormValues } from "./LandingPage";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

interface PreviewData {
  basicInfo: {
    name: string;
    tagline: string;
    description: string;
    averageCost: string;
    hours: string;
    subtitle: string;
    contact: {
      email: string;
      phone: string;
      whatsapp: string;
      address: string;
    };
    social: {
      instagram: string;
      facebook: string;
    };
  };
  heroImage: {
    name : string;
    url: string;
    type: string;
    status: boolean;

  },
  categories: Array<{
    id: number;
    name: string;
    image: string;
  }>;
  galleryImages: string[];
  footerInfo: {
    copyright: string;
    license: string;
    companyName: string;
  };
}

interface MobilePreviewProps {
  data: FormValues;
}



export default function MobilePreview({ data }: MobilePreviewProps) {
    const modifiedIframe = data.footerInfo.contact?.locationIframe?.replace(/width="[^"]*"/, 'width="400"')  // Replace any width with 400
  ?.replace(/height="[^"]*"/, 'height="300"'); // Replace any height with 300



   const [subCategoryData,setSubCatergoryData] = useState([])

 const fetchSubcategories = async() => {
const response =  await axios.get( BASE_URL +`/api/categoryMappings/subCategories`)

setSubCatergoryData(response.data)
}

useEffect(() => {

  fetchSubcategories()
},[])
  return (
    <div className="w-72 max-w-sm mx-auto">
      {/* Mobile Frame */}
      <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
        <div className="bg-white rounded-[2.5rem] overflow-hidden h-[600px] relative ">
          {/* Status Bar */}
          <div className="bg-white px-6 py-2 flex justify-between items-center text-sm font-medium">
            <span>6:06 PM</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">5G</span>
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
              </div>
              <div className="w-6 h-3 border border-black rounded-sm">
                <div className="w-4 h-2 bg-black rounded-sm m-0.5"></div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="h-full overflow-y-auto">
            {/* Header */}
            <header className="bg-black text-white p-4 sticky top-0 z-50">
              <div className="flex items-center justify-between">
                {/* Menu Button */}
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800 p-2">
                  <div className="flex flex-col gap-1">
                    <div className="w-4 h-0.5 bg-white"></div>
                    <div className="w-4 h-0.5 bg-white"></div>
                    <div className="w-4 h-0.5 bg-white"></div>
                  </div>
                </Button>

                {/* Center Logo */}
                  
          <div className="mx-auto flex  flex-col items-center justify-center text-center">
                    <h1 className="text-sm font-bold tracking-wider">{data.basicInfo.name}</h1>
                    <p className="text-xs opacity-80">{data.basicInfo.tagline}</p>
                  </div>
                  <div className="flex gap-1">
                    
                  </div>
                

                <div className="w-8"></div>
              </div>
            </header>

            {/* Hero Section */}
      <div className="w-full h-48 md:h-[60vh] flex items-center justify-center bg-white">
        {data.heroImage?.url ? (
          <img
            src={data.heroImage.url}
            alt={data.heroImage.name || "Restaurant hero"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Hero Image</span>
          </div>
        )}
      </div>

            {/* Menu Section */}
            <section className="py-6 px-4">
              <h2 className="text-xl font-bold text-center mb-8">OUR MENU</h2>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {subCategoryData.map((category) => (
                  <Card key={category.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white rounded-2xl">
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        {category.imgURL ? (
                          <img
                            src={category.imgURL[0].url|| "/placeholder.svg"}
                            alt={category.name}
                            className="object-cover w-full h-full "
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">{category.categoryName}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-center">
                        <h3 className="font-semibold text-sm">{category.categoryName}</h3>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* About Section */}
            <section className="py-6 px-4 bg-gray-50">
              <h2 className="text-xl font-bold text-center mb-4">ABOUT US</h2>
              <p className="text-gray-600 text-center text-sm mb-6 leading-relaxed">{data.basicInfo.description}</p>

              <div className="flex flex-col gap-3">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg text-sm">
                  <Instagram className="w-4 h-4 mr-2" />
                  Follow us on Instagram
                </Button>
                <Button className="bg-blue-600 text-white py-2 rounded-lg text-sm">
                  <Facebook className="w-4 h-4 mr-2" />
                  Like us on Facebook
                </Button>
              </div>
            </section>

            {/* Gallery Section */}
            <section className="py-6 px-4">
              <h2 className="text-xl font-bold text-center mb-4">GALLERY</h2>
              <div className="text-center mb-4">
                <Badge variant="outline" className="px-3 py-1 text-xs">
                  Ambience
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data.galleryImages.slice(0, 6).map((image, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden rounded-lg">
                    {image ? (
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Gallery image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Gallery {index + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Location Section */}
                <div className="bg-gray-300 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden" style={{ height: 150, width: 400, maxWidth: "100%" }}>
                    <div
                        className="absolute inset-0"
                        style={{ width: 400, height: 150, maxWidth: "100%" }}
                        dangerouslySetInnerHTML={{ __html: data.footerInfo.contact.locationIframe }}
                    />
                </div>

            {/* Footer Section */}
            <footer className="bg-black text-white py-6 px-4">
              <div className="text-center space-y-4">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {/* {[ChefHat, Utensils, Coffee, Wine].map((Icon, index) => (
                        <Icon key={index} className="w-3 h-3" />
                      ))} */}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-wider">{data.basicInfo.name}</h3>
                      <p className="text-xs opacity-80">{data.basicInfo.tagline}</p>
                    </div>
                    <div className="flex gap-1">
                      {/* {[Wine, Coffee, Utensils, ChefHat].map((Icon, index) => (
                        <Icon key={index} className="w-3 h-3" />
                      ))} */}
                    </div>
                  </div>
                </div>

                <div>
                  <Badge variant="outline" className="bg-white text-black text-xs mb-3">
                    Dine-In | Takeaway
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Average Cost</h4>
                  <p className="text-orange-400 text-sm">{data.footerInfo.averageCost}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">OPENING HOURS</h4>
                  <p className="text-orange-400 font-semibold text-sm">{data.footerInfo.hours}</p>
                  <p className="text-xs opacity-80">{data.footerInfo.subtitle}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">CONTACT US</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span>{data.footerInfo.contact.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>WhatsApp: {data.footerInfo.contact.whatsapp}</span>
                    </div>
                    <div className="flex items-start justify-center gap-2">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="text-center text-xs leading-tight">{data.footerInfo.contact.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">FOLLOW US</h4>
                  <div className="flex justify-center gap-4">
                    <Facebook className="w-5 h-5 cursor-pointer hover:text-blue-400 transition-colors" />
                    <Instagram className="w-5 h-5 cursor-pointer hover:text-pink-400 transition-colors" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-xs opacity-60">{data.footerInfo.copyright}</p>
                  <p className="text-xs opacity-60 italic">{data.footerInfo.companyName}</p>
                  <p className="text-xs opacity-60">{data.footerInfo.license}</p>
                </div>

                <div className="flex justify-center gap-6 text-xs opacity-60">
                  <span>Home</span>
                  <span>Privacy</span>
                  <span>Terms of Service</span>
                  <span>Cookies Policy</span>
                </div>
              </div>
            </footer>
          </div>

          {/* Browser Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-100 px-4 py-2 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 text-xs">
              {/* <span>🔒</span> */}
              {/* <span>http://localhost:5173</span> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}