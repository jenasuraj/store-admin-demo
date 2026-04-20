import { useEffect, useState } from "react"
import { BASE_URL } from "@/lib/constants"
import axios from "axios"
import DynamicForm from "../template-manager/DynamicForm"



interface Template {
  id: number;
  name: string;
  description: string;
  tabs: Record<string, any>;
}

const LandingPage = () => {

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const fetchAssignedTemplate = async () => {
    try {
      const response = await axios.get(BASE_URL + '/api/template/assigned');
      const rawData = Array.isArray(response.data) ? response.data[0] : response.data;
      
      if (!rawData) {
        setSelectedTemplate(null);
        return;
      }
      const templateJson = rawData.templateJson || [];
      const tabs = templateJson[0]?.tabs || {};
      
      setSelectedTemplate({
        id: rawData.id,
        name: rawData.templateName,
        description: rawData.description || '',
        tabs: tabs,
      });
    } catch (error) {
      console.error('Failed to fetch assigned template', error);
      alert('Failed to load template. Please try again.');
      setSelectedTemplate(null);
    }
  };



  useEffect(() => {
    fetchAssignedTemplate();
  }, []);


  return (
    <div className="h-screen w-full p-6">
      {selectedTemplate ? (
        <div className="space-y-4">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedTemplate.name} Template
            </h1>
            <p className="mt-2">{selectedTemplate.description}</p>
          </div>
          <DynamicForm template={selectedTemplate} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">No template assigned yet.</p>
        </div>
      )}
    </div>
  );
};

export default LandingPage;









































/**
 * 
 * import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Save } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import MobilePreview from "./MobilePreview"
import ImageUploadModal from "../Products/Components/ImageUploadModal"
import { useEffect, useState } from "react"
import { BASE_URL } from "@/lib/constants"
import axios from "axios"
import DynamicForm from "../template-manager/DynamicForm"
 * 
 * 
 * 
 * 
const categorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Category name is required"),
  image: z.string().optional(),
})

const contactSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsapp: z.string().min(10, "WhatsApp number must be at least 10 digits"),
  address: z.string().min(10, "Please enter a complete address"),
  locationIframe : z.string()
})

const socialSchema = z.object({
  instagram: z.string(),
  facebook: z.string(),
})

const footerInfoSchema = z.object({
  copyright: z.string(),
  license: z.string(),
  companyName: z.string(),
    averageCost: z.string().min(5, "Average cost must be at least 5 characters"),
    hours: z.string().min(4, "Opening hours must be at least 4 characters"),
    subtitle: z.string().min(5, "Subtitle must be at least 5 characters"),
    contact: contactSchema,
    social: socialSchema,
})
const heroImageSchema = z.object({
  name: z.string().min(1, "Image name is required"),
  url: z.string().url("Please provide a valid image URL"),
  status: z.boolean().default(true),
  type: z.string().min(1, "Image type is required"),
});

const formSchema = z.object({
  basicInfo: z.object({
    name: z.string().min(2, "Restaurant name must be at least 2 characters"),
    tagline: z.string().min(5, "Tagline must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters").max(200, "Description must be at most 200 characters"),
  
  }),
  heroImage: heroImageSchema,
  // categories: z.array(categorySchema),
  galleryImages: z.array(z.string()),
  footerInfo: footerInfoSchema,
})

export type FormValues = z.infer<typeof formSchema>

export default function LandingPage() {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [id,setId] = useState('');

  const [apiResponse, setApiResponse] = useState([]);

  const getAllErrorMessages = () => {
  const errors = form.formState.errors
  const messages: string[] = []

 

  // Basic Info errors
  if (errors.basicInfo) {
    if (errors.basicInfo.name) messages.push(errors.basicInfo.name.message)
    if (errors.basicInfo.tagline) messages.push(errors.basicInfo.tagline.message)
    if (errors.basicInfo.description) messages.push(errors.basicInfo.description.message)
    if (errors.footerInfo.averageCost) messages.push(errors.footerInfo.averageCost.message)
    if (errors.footerInfo.hours) messages.push(errors.footerInfo.hours.message)
    if (errors.footerInfo.subtitle) messages.push(errors.footerInfo.subtitle.message)
    
    // Contact errors
    if (errors.footerInfo.contact) {
      if (errors.footerInfo.contact.email) messages.push(errors.footerInfo.contact.email.message)
      if (errors.footerInfo.contact.phone) messages.push(errors.footerInfo.contact.phone.message)
      if (errors.footerInfo.contact.whatsapp) messages.push(errors.footerInfo.contact.whatsapp.message)
      if (errors.footerInfo.contact.address) messages.push(errors.footerInfo.contact.address.message)
      if (errors.footerInfo.contact.locationIframe) messages.push(errors.footerInfo.contact.locationIframe.message)
    }
  }

  // Hero image error
  if (errors.heroImage) messages.push(errors.heroImage.message)

  // Menu categories errors
  // if (errors?.categories) {
  //   errors?.categories?.forEach((catError, index) => {
  //     if (catError?.name) messages.push(`Menu Category ${index + 1}: ${catError.name.message}`)
  //   })
  // }

  // Gallery images errors
  if (errors.galleryImages) {
    errors.galleryImages.forEach((imgError, index) => {
      if (imgError) messages.push(`Gallery Image ${index + 1} is invalid`)
    })
  }

  // Footer errors
  if (errors.footerInfo) {
    if (errors.footerInfo.copyright) messages.push(errors.footerInfo.copyright.message)
    if (errors.footerInfo.license) messages.push(errors.footerInfo.license.message)
    if (errors.footerInfo.companyName) messages.push(errors.footerInfo.companyName.message)
  }

  return messages
}
  const [activeTab, setActiveTab] = useState("basic")

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basicInfo: {
        name: "THE FOOD STUDIO",
        tagline: "Kitchen & Bar",
        description:
          "Embark on a flavorful journey with super delicious food served in mesmerizing interiors! Step into a haven of scrumptious flavors & feel the rustic modernism in every corner.",
        
      },
 heroImage: {
    name: "hero-image",
    url: "https://d3kanykijpjn5y.cloudfront.net/da4ebb3e7c381b59bbbae758c901a959.gif",
    status: true,
    type: "image/gif"
  },   
  
  // categories: [
  //       { id: 1, name: "Food", image: "/placeholder.svg?height=150&width=150" },
  //       { id: 2, name: "Desserts", image: "/placeholder.svg?height=150&width=150" },
  //       { id: 3, name: "Beverages", image: "/placeholder.svg?height=150&width=150" },
  //       { id: 4, name: "Drinks", image: "/placeholder.svg?height=150&width=150" },
  //     ],
      galleryImages: [
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
      ],
      footerInfo: {
        copyright: "©Copyright 2021 M/s Good Food Gourmet",
        license: "License Number/ Reference No: 11523014000357",
        companyName: "Issai",
                averageCost: "INR 1600 for two people (approx)",
                hours: "12:00 PM - 1:00 AM",
        subtitle: "Happily Serving You Everyday!",
        contact: {
          email: "info@thefoodstudio.in",
          phone: "+91 8879001999",
          whatsapp: "+91 8879001999",
          address:
            "Ground Floor, Sahayog Commercial Complex, Near MTNL Office - Happy Valley, Tikuji Ni Wadi Road, Chitaisar-Manpada, Thane (West) - 400607",
             locationIframe : '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1884.0636960288573!2d72.97219808967289!3d19.189637453938452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b92567224587%3A0x3ca642fd942e3c6b!2sEdureka%20Learning%20Center%20(Offline)%20Thane%20%7C%7CFull%20Stack%20Web%20Development%2CData%20Science%2CCloud%26DevOps%2CSoftware%20Testing%20.!5e0!3m2!1sen!2sin!4v1749624306671!5m2!1sen!2sin" width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
        },
        social: {
          instagram: "@thefoodstudio",
          facebook: "The Food Studio",
        },

      },
    },
  })

  // Watch all form values for real-time preview
  const watchedValues = form.watch()

  // Add a menu category
  // const addMenuCategory = () => {
  //   const currentCategories = form.getValues("categories")
  //   const newId = currentCategories.length > 0 ? Math.max(...currentCategories.map((c) => c.id)) + 1 : 1

  //   form.setValue("categories", [...currentCategories, { id: newId, name: "", image: "" }])
  // }

  // Remove a menu category
  // const removeMenuCategory = (id: number) => {
  //   const currentCategories = form.getValues("categories")
  //   form.setValue(
  //     "categories",
  //     currentCategories.filter((cat) => cat.id !== id),
  //   )
  // }

  // Add a gallery image
  const addGalleryImage = () => {
    const currentImages = form.getValues("galleryImages")
    form.setValue("galleryImages", [...currentImages, ""])
  }

  // Remove a gallery image
  const removeGalleryImage = (index: number) => {
    const currentImages = form.getValues("galleryImages")
    form.setValue(
      "galleryImages",
      currentImages.filter((_, i) => i !== index),
    )
  } 

  // Form submission handler
 async function onSubmit(data: FormValues) {
  try {
    // Check if we have existing data by looking at the first category or other required field
    // const hasExistingData = form.getValues("categories").length > 0 || 
      const hasExistingData =    form.getValues("basicInfo.name") !== "";
    
    let response;
    if (apiResponse.length > 0 ) {
      // Update existing
      response = await axios.put(`${BASE_URL}/api/landingPage/update/${id}`, data);
      if(response.status === 200 || response.status === 204 || response.status === 201) {
      toast.success("Landing page updated successfully!");
      }
    } else {
      // Create new
      response = await axios.post(`${BASE_URL}/api/landingPage/save`, data);
      if(response.status === 201 || response.status === 200) {
              toast.success("Landing page created successfully!");

      }
      
      // If your API returns the created data with ID, you might want to:
      if (response.data) {
        form.reset(response.data); // Populate form with the created data
      }
    }
    
    console.log("Form submitted:", response.data);
  } catch (error) {
    toast.error("Failed to submit form.");
    console.error("Submission error:", error);
  }
}
  // const [isImageModalOpen, setIsImageModalOpen] = useState(false);


  useEffect(() => {
  const fetchLandingPageData = async () => {
    try {
      const response = await axios.get(BASE_URL + "/api/landingPage/get");
      
      if (response.data && response.data.length > 0) {
        // We have existing data - populate form (edit mode)
        console.log("Landing page data fetched successfully:", response.data[0]);
        form.reset(response.data[response.data.length -1]); // Reset entire form with the data
        setId(response.data[response.data.length -1].id); // Set the ID for future updates
        setApiResponse(response.data);
        toast.success("Landing page data loaded!");
      } else {
        // Empty array - new form (create mode)
        console.log("No existing landing page data - starting fresh");
        toast.info("No existing data found - ready to create new landing page");
      }
    } catch (error) {
      toast.error("Failed to fetch landing page data.");
      console.error("Fetch error:", error);
    }
  };

  fetchLandingPageData();
}, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
         
        <div className="flex-1 p-4 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Landing Page Admin Panel</h1>
              <p className="text-gray-600">Manage your home page content</p>
            </div>
            <div className={ Object.keys(form.formState.errors).length > 0? "bg-gray-300 text-gray-700 cursor-not-allowed rounded-md " : "bg-blue-600 text-white flex gap-2 rounded-md"}>
             
             
            </div>
            
          </div>
                        {Object.keys(form.formState.errors).length > 0 && (
  <div className="text-red-500 text-sm mt-2 flex justify-end">
<h3>    Please fill the fields in the form correctly before submitting.
</h3>  </div>
)}


          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="hero">Hero Section</TabsTrigger>
  
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger> 
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle> Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="basicInfo.name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel> Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter restaurant name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="basicInfo.tagline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tagline</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter tagline" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="basicInfo.description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>About Us</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter restaurant description" rows={4} {...field} />
                            </FormControl>
                            <FormDescription>Describe your restaurant in at least 20 characters</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                 
                    

                    
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hero" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Hero Section</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <FormField
        control={form.control}
        name="heroImage.url"
       
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hero Image/GIF URL</FormLabel>
            <div className="flex gap-2">
              <FormControl>
             
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImageModalOpen(true)}
                className="w-full"
              >
                Upload Image
              </Button>
            </div>
            {field.value && (
              <div className="mt-2 space-y-2">
                <img 
                  src={field.value} 
                  alt="Hero preview" 
                  className="h-40 object-cover rounded-md"
                />
                <div className="text-sm text-muted-foreground">
                  Current image: {form.watch("heroImage.name")}
                </div>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      
      
     
      <FormField
        control={form.control}
        name="heroImage.status"
        render={({ field }) => (
          <FormControl>
           
          </FormControl>
        )}
      />
      <FormField
        control={form.control}
        name="heroImage.type"
        render={({ field }) => (
          <FormControl>
            <Input type="hidden" {...field} />
          </FormControl>
        )}
      />
    </CardContent>
  </Card>
</TabsContent>

                {/* <TabsContent value="menu" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Menu Categories</CardTitle>
                        <Button type="button" onClick={addMenuCategory}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Category
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {form.watch("categories").map((category, index) => (
                        <div key={category.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <Badge variant="outline">Category {index + 1}</Badge>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeMenuCategory(category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`categories.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Food, Desserts" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`categories.${index}.image`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Image URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter image URL" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent> 

                <TabsContent value="gallery" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Gallery Images</CardTitle>
                        <Button type="button" onClick={addGalleryImage}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Image
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {form.watch("galleryImages").map((image, index) => (
                          <div key={index} className="flex gap-4 items-end border rounded-lg p-4">
                            <div className="flex-1">
                              <FormField
                                control={form.control}
                                name={`galleryImages.${index}`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Image {index + 1} URL</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter image URL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="footerInfo.contact.email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="footerInfo.contact.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="footerInfo.contact.whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter WhatsApp number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="footerInfo.contact.address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter full address" rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="footerInfo.contact.locationIframe"
                        render={({ field }) => (

                          <FormItem>
                            <FormLabel>Google Maps</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter embedded location Iframe" rows={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Social Media</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="footerInfo.social.instagram"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instagram Handle</FormLabel>
                                <FormControl>
                                  <Input placeholder="@username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="footerInfo.social.facebook"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Facebook Page</FormLabel>
                                <FormControl>
                                  <Input placeholder="Page name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="footer" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Footer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="footerInfo.copyright"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Copyright Text</FormLabel>
                            <FormControl>
                              <Input placeholder="©Copyright 2021 Company Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="footerInfo.companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="footerInfo.license"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Information</FormLabel>
                            <FormControl>
                              <Input placeholder="License Number/ Reference No: ..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                        <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="footerInfo.averageCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Average Cost</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., INR 1600 for two people" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="footerInfo.hours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opening Hours</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 12:00 PM - 1:00 AM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="footerInfo.subtitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hours Subtitle</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Happily Serving You Everyday!" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                   <div className="flex justify-between items-center mb-6">
           
            <div className={ Object.keys(form.formState.errors).length > 0? "bg-gray-300 text-gray-700 cursor-not-allowed rounded-md " : "bg-blue-600 text-white flex gap-2 rounded-md"}>
              <Button onClick={form.handleSubmit(onSubmit)}  className={Object.keys(form.formState.errors).length>0? "cursor-not-allowed" : ""}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
             
            </div>
            
            
          </div>
                        {form.formState.errors && (
    <div className="text-red-500 text-sm">
      {getAllErrorMessages().map((message, index) => (
        <div>
        <div key={index}>{message}
       
        </div>
{       
}        </div>
      ))}
    </div>
  )}
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>

   
        <div className="w-96 bg-gray-100 p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-600">See changes in real-time</p>
          </div>
          <MobilePreview data={watchedValues} />
        </div>
 </div>
         
     <ImageUploadModal
      isOpen={isImageModalOpen}
      onClose={() => setIsImageModalOpen(false)}
      onUpload={(images) => {
        if (images.length > 0) {
          const uploadedImage = images[0];
          form.setValue("heroImage", {
            name: uploadedImage.img_name,
            url: uploadedImage.img_url,
            status: true,
            type: uploadedImage.img_type
          });
        }
      }}
    />
    </div>
  )
} */